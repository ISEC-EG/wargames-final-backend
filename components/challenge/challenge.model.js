const mongoose = require("mongoose");

const Challenge = new mongoose.Schema(
  {
    title: { type: String, unique: true },
    description: { type: String, default: "" },
    category: { type: String },
    externalLink: { type: String },
    level: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    author: { type: String, default: "ISEC" },

    flag: { type: String },

    //Hints?????????
    hintLevel: { type: Number, default: 0 }, // to variety of hints and score
    hints: [String], //The actual hints
  },
  { timestamps: true, usePushEach: true }
); /// to make the array push available in DB

// create the model for users and expose it to our app
module.exports = mongoose.model("Challenge", Challenge);
