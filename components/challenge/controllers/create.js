const Challenge = require("../challenge.model");
const { challenge: challengeSchema } = require("../challenge.validate");

async function createChallenge(req, res) {
  try {
    const { error, value } = challengeSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.message.replace(/"/g, "") });

    let ifChallenge = await Challenge.findOne({ title: value.title }).select(
      "_id title"
    );
    if (ifChallenge)
      return res
        .status(409)
        .json({ message: "Title already exists use another one" });

    const challenge = await Challenge.create(value);

    return res.status(200).send(challenge);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = createChallenge;
