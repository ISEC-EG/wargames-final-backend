const Team = require("../team.model");

async function removeTeam(req, res) {
  try {
    let team = await Team.findOneAndDelete({ email: req.body.email });
    if (!team) return res.status(404).json({ message: "team not found" });

    return res.status(200).json({ message: "team Removed Successfully" });
  } catch (e) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = removeTeam;
