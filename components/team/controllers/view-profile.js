const mongoose = require("mongoose");

const Team = require("../team.model");
const Solution = require("../solution.model");
const Challenge = require("../../challenge/challenge.model");

async function viewProfile(req, res) {
  try {
    let teamID;
    if (req.params.id) teamID = req.params.id;
    else teamID = req.userData._id;

    if (!mongoose.Types.ObjectId.isValid(teamID))
      return res.status(400).send({ message: "Invalid Team" });

    let team = await Team.findOne(
      { _id: teamID, isVerified: true },
      "-role -password -otpNextResendAt -forgotPasswordNextResetAt -otpRequestCounter -forgotPasswordResetCounter -otp -__v -leader -isVerified -active -createdAt -updatedAt"
    );

    if (!team) return res.status(409).json({ message: "Team not found" });

    let solutions = await Solution.find(
      { team: teamID },
      "challenge points updatedAt"
    )
      .sort({ updatedAt: -1 })
      .populate("challenge", "title description category _id");

    let sortedUsers = await Team.find({ role: "user" }, "name score country", {
      sort: { score: -1, scoreUpdateAt: 1 },
    });

    for(let i = 0; i< solutions.length; i++) {
      solutions[i].updatedAt = new Date(new Date(solutions[i].updatedAt).getTime() + 2 * 3600 * 1000);
    }


    let teamRank = sortedUsers.findIndex((x) => x.name == team.name);

    team = JSON.parse(JSON.stringify(team));

    team["solutions"] = solutions;
    team["rank"] = +teamRank + 1;

    let totalChallenges = await Challenge.find({}).countDocuments();
    team["totalChallenges"] = +totalChallenges;

    return res.status(200).send(team);
  } catch (e) {
    console.log(e.message)
    return res.status(500).send({ message: "Internal server error" });
  }
}

module.exports = viewProfile;
