const Team = require("../team.model");

async function getOtp(req, res) {
  try {
    let team = await Team.findOne({ email: req.body.email }).select("otp");
    if (!team) return res.status(404).json({ message: "team not found" });

    return res.status(200).json({ otp: team.otp });
  } catch (e) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = getOtp;
