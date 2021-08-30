const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");

const config = require("../../config");

const Team = new mongoose.Schema(
  {
    leader: { type: String, default: "" },
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    userID: { type: String, unique: true, default: "" },
    score: { type: Number, default: 0 },
    password: { type: String, required: true },
    country: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    challengesHints: [],
    members: [{ name: { type: String }, email: { type: String } }],
    scoreUpdateAt: { type: Date, default: Date.now },
    otp: { type: String },
    otpSubmitCounter: { type: Number, default: 0 },
    otpNextResendAt: { type: Date, default: Date.now },
    otpRequestCounter: { type: Number, default: 0 },
    forgotPasswordNextResetAt: { type: Date, default: Date.now },
    forgotPasswordResetCounter: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    role: { type: String, default: "user" },
  },
  { usePushEach: true, timestamps: true }
); /// to make the array push available in DB

Team.index({ email: 1 });

Team.methods.signTempJWT = function () {
  return jwt.sign(
    { _id: this._id, email: this.email },
    config.tempTokenSecret,
    {
      algorithm: "HS256",
      expiresIn: `${config.tempTokenDurationInHours}h`,
    }
  );
};

// check Password Validation
Team.methods.isPasswordValid = async function (password) {
  return await bcrypt.compare(password, this.password);
};

Team.query.byEmail = function (email) {
  return this.where({ email: new RegExp(email, "i") });
};

Team.query.byID = function (id) {
  return this.where({ _id: mongoose.Types.ObjectId(id) });
};

Team.pre("find", function (next) {
  this.find({ isVerified: { $ne: false }, role: "user" });
  this.select("name score country _id");
  this.sort({ score: -1, scoreUpdateAt: 1 });
  next();
});

Team.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.userID = await uuid.v5(this.id, uuid.v5.URL);
  this.isVerified = true;
});

Team.methods.updateOtp = function () {
  let blockTimeInMinutes = 1;
  let nextResendTime = 0;

  // block user for 1h if he made 5 requests
  // otherwise block user for 1 minute
  if (this.otpRequestCounter === 4) {
    blockTimeInMinutes = 60;
    this.otpRequestCounter = -1; // set otpRequestCounter to 0 after (1) hour of blocking
    nextResendTime = new Date().getTime() + blockTimeInMinutes * 60 * 1000;
  } else if (this.otpRequestCounter === 3) {
    blockTimeInMinutes = 30;
    nextResendTime = new Date().getTime() + blockTimeInMinutes * 60 * 1000;
  } else if (this.otpRequestCounter === 2) {
    blockTimeInMinutes = 15;
    nextResendTime = new Date().getTime() + blockTimeInMinutes * 60 * 1000;
  } else if (this.otpRequestCounter === 1) {
    blockTimeInMinutes = 5;
    nextResendTime = new Date().getTime() + blockTimeInMinutes * 60 * 1000;
  } else {
    nextResendTime = new Date().getTime() + blockTimeInMinutes * 1000; // 1 second
  }

  // generate 6-digits OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  this.otp = otp;
  this.otpNextResendAt = new Date(nextResendTime);
  this.otpRequestCounter++;
};

Team.methods.updateSubmitOtp = function () {
  let blockTimeInMinutes = 1;
  let nextResendTime = 0;

  // block user for 1h if he made 5 requests
  // otherwise block user for 1 minute
  if (this.otpSubmitCounter === 5) {
    this.otpSubmitCounter = -1;
    nextResendTime = new Date().getTime() + 30 * blockTimeInMinutes * 60 * 1000;
  } else
    nextResendTime = new Date().getTime() + blockTimeInMinutes * 1000; // 1 second

  this.otpNextResendAt = new Date(nextResendTime);
  this.otpSubmitCounter++;
};

Team.methods.updateResetPasswordCounter = function () {
  let blockTimeInMinutes = 3;
  let nextResendTime = 0;

  // block user for 3h if he made 3 requests
  // else for 5 minutes
  // otherwise block user for 3 minutes
  if (this.forgotPasswordResetCounter === 2) {
    blockTimeInMinutes = 3 * 60 * 60 * 1000; // 3Hours
    this.forgotPasswordResetCounter = -1;
    nextResendTime = new Date().getTime() + blockTimeInMinutes;
  } else if (this.forgotPasswordResetCounter === 1) {
    blockTimeInMinutes = 5;
    nextResendTime = new Date().getTime() + blockTimeInMinutes * 60 * 1000;
  } else {
    nextResendTime = new Date().getTime() + blockTimeInMinutes * 60 * 1000;
  }

  this.forgotPasswordNextResetAt = new Date(nextResendTime);
  this.forgotPasswordResetCounter++;
};

module.exports = mongoose.model("Team", Team);
