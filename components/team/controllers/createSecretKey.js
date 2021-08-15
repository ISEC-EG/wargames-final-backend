const Secret = require("../secret.model");
const uuid = require("uuid");

async function createSecretKey(req, res) {
  try {
    let date = Date.now();
    let key = await uuid.v5(date.toString(), uuid.v5.URL);
    const secret = await Secret.create({ key });
    secret.save();
    return res.status(200).send({ secret });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = createSecretKey;