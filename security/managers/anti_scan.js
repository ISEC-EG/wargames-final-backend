const redis = require("redis");

const Logger = require("../../utils/logger");
const Config = require("../../config");
const requestIp = require("request-ip");
// const Say = require('../../langs');

const client = redis.createClient({
  host: Config.RedisHost,
  port: Config.RedisPort,
  // port: 18072,
  // password: "kpoKVAW1WrR2ZgC66AMr6LMgaU0p4Eco",
  // host: "redis-18072.c44.us-east-1-2.ec2.cloud.redislabs.com"
});

client.on("error", function (err) {
  Logger.trace("danger", "anit-scan REDIS", err, true);
});

const dayInSec = 86400;
const prefix = "monit404:";
const prefixBlocked = "blocked:";

const checkMax = 4;
const scanMax = 7;

module.exports = {
  log404(req) {
    // get client ip
    const ip = requestIp.getClientIp(req);
    // reference to monit and block
    const ipToMonit = prefix + ip;
    const ipToBlock = prefixBlocked + ip;

    // request monit
    client.hgetall(ipToMonit, function (err, object) {
      if (err) console.log(err);

      if (object) {
        if (object.count >= scanMax) {
          console.log(`${ip} blocked for scanning`);
          client.hmset(ipToBlock, object);
          client.expireat(
            ipToBlock,
            parseInt(+new Date() / 1000) + dayInSec * Config.scanBlockInDays
          );
        }
        // saving visit
        object.count++;
        client.hmset(ipToMonit, object);
      } else {
        client.hmset(ipToMonit, { count: 1 });
        client.expireat(ipToMonit, parseInt(+new Date() / 1000) + dayInSec);
      }
    });
  },
  preventBlocked(req, res, next) {
    const ipToBlock = prefixBlocked + requestIp.getClientIp(req);
    client.hgetall(ipToBlock, function (err, object) {
      if (object) {
        return res.status(429).json({ message: "Your IP blocked for Scanning" });
      } else {
        next();
      }
    });
  },
};
