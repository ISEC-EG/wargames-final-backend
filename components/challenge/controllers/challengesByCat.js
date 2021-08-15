const mongoose = require("mongoose");
const Challenge = require("../challenge.model");
const Team = require("../../team/team.model");
const Solution = require("../../team/solution.model");
const { category: categoryValidation } = require("../challenge.validate");

async function challengesByCat(req, res) {
  try {
    req.body.category = req.params.cat;
    const { error, value } = categoryValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.message.replace(/"/g, "") });

    let team = await Team.findById(req.userData._id).select('_id');
    if (!team)
      return res.status(401).json({ message: "Unauthorized team" });


    let challenges = await Challenge.find(
      { category: value.category },
      `_id title category points level`
    );
    if (!challenges) res.status(200).send(challenges);

    challenges = JSON.parse(JSON.stringify(challenges));

    for (let challenge in challenges) {
      solved = await Solution.findOne({
        challenge: mongoose.Types.ObjectId(challenge._id),
        team: mongoose.Types.ObjectId(req.userData._id),
      });
      solved
        ? (challenges[challenge]["solved"] = true)
        : (challenges[challenge]["solved"] = false);
    }

    return res.status(200).send(challenges);
  } catch (e) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = challengesByCat;