module.exports = {
	dbURI: "mongodb://127.0.0.1:27017/wargames-final-2021",
	SESSION_SECRET: "7fa6f51e-92ae-4f9c-aaa5-9080a003f254",
	ORIGIN_CORS: ["http://localhost:4200", "http://192.168.1.55:4200", "http://10.0.0.200:4200"],
	ticketValidationInDays: 365,
	RedisHost: "127.0.0.1",
	RedisPort: 6379,
	"banDurationInHours": 1,
	"freeRetriesOnStrictRoutes": 100,
	"timeBetweenPasswordResetsInHours": 2,
	"maxLogins": 6,
	"maxTicketUsagePerHour": 1200,
	"foreignIpBlockInDays": 365,
	"scanBlockInDays": 15,
	tempTokenDurationInHours: 1,
	"timeZone": "Africa/Cairo",
	email: {
		user: "arcosec20@gmail.com",
		pass: "@Isec2020"
	},
}