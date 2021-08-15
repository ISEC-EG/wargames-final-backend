const createError = require("http-errors");
const mongoose = require("mongoose");

const Team = require("../team.model");
const Email = require("../../../modules/email");
const catchAsync = require("../../../utils/catchAsync");

sendVerification = catchAsync(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.userData._id))
    return res.status(400).json({ message: "Invalid Team Id" });

  const team = await Team.findOne().byID(req.userData._id);
  if (!team) return next(createError(401, "Team is not found"));

  let timeInSeconds = (team.otpNextResendAt - new Date()) / 1000;
  const responseBody = {
    timeInSeconds,
    email: team.email,
    message: "To update email or resend verification please try again later",
  };


  // if otp next resend time didn't expire
  let otpNextDate = new Date(team.otpNextResendAt);
  let milliseconds = otpNextDate.getTime();

  if (milliseconds > Date.now()) {
    let timeNextOpt = Math.trunc(
      (new Date(team.otpNextResendAt) - Date.now()) / (1000 * 60)
    );
    responseBody.message = `Try again later after ${timeNextOpt + 1} minute(s)`;
    // logger.error(`To update email or resend verification please try again later, ${responseBody.timeInSeconds}, ${responseBody.email}`, 400, 'send verification');
    return res.status(400).json(responseBody);
  }

  team.updateOtp();
  await team.save();

  await new Email(team, team.otp).sendWelcome();
  timeInSeconds = (team.otpNextResendAt - new Date()) / 1000;
  responseBody.message = "Please Check your Email";

  responseBody.timeInSeconds = timeInSeconds;
  return res.status(200).send(responseBody);
});

module.exports = sendVerification;
