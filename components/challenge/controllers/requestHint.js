const mongoose = require("mongoose");
const Challenge = require("../challenge.model");
const Team = require("../../team/team.model");
const Solution = require("../../team/solution.model");
const Socket = require("../../../socket");

async function requestHint(req, res) {
  try {
    let challengeID = req.params.challengeId;
    // check challenge ID
    if (!mongoose.Types.ObjectId.isValid(challengeID))
      return res.status(400).json({ message: "Invalid Challenge" });

    // check if team exists
    let team = await Team.findById(req.userData._id);
    if (!team)
      return res.status(401).json({ message: "Unauthorized Team not found" });

    // check if challenge exists
    let challenge = await Challenge.findById(challengeID);
    if (!challenge)
      return res
        .status(401)
        .json({ message: "Unauthorized Challenge not found" });

    if (challenge.hints.length === 0) {
      return res
        .status(400)
        .json({ message: "There's not hint exists for this challenge" });
    }

    // check if challenge not solved before
    let solved = await Solution.findOne({
      challenge: mongoose.Types.ObjectId(challengeID),
      team: mongoose.Types.ObjectId(req.userData._id),
    }).select('_id');

    if (solved)
      return res.status(409).json({ message: "Challenge Already solved" });

    let challengeHints = team.challengesHints;
    for (let i = 0; i < challengeHints.length; i++) {
      if (team.challengesHints[i] == challengeID) {
        return res.status(201).send({ hint: challenge.hints[0] });
      }
    }

    let hint = challenge.hints[0];

    team.score -= 0.3 * challenge.points;
    if (team.score < 0)
      return res
        .status(400)
        .json({ message: "Team not have enough points to pay hint" });

    team.challengesHints.push(challengeID);
    // team.scoreUpdate = new Date();
    team.save();

    Socket.updateDashboard();

    return res.status(200).send({ hint, score: team.score });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = requestHint;
