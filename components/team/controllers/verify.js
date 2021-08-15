const createError = require("http-errors");
const catchAsync = require("../../../utils/catchAsync");
const Team = require("../team.model");
const { otp: otpSchema } = require("../team.validation");
const securityModule = require("../../../security");
const Config = require("../../../config");

verify = catchAsync(async (req, res, next) => {
  // validate all data felids
  const { error, value } = otpSchema.validate(req.body);
  // there are error in the validation data not valid
  if (error)
    return res
      .status(400)
      .json({ message: error.message.replace(/"/g, ""), status: 400 });

  const team = await Team.findOne(
    { _id: req.userData._id },
    "-__v -createdAt -updatedAt -forgotPasswordNextResetAt -forgotPasswordResetCounter"
  );
  if (!team) return next(createError(401, "Team is not found"));
  // if otp !== the code sent

  // if otp next resend time didn't expire
  let otpNextDate = new Date(team.otpNextResendAt);
  let milliseconds = otpNextDate.getTime();

  if (milliseconds > Date.now()) {
    let timeNextOpt = Math.trunc(
      (new Date(team.otpNextResendAt) - Date.now()) / (1000 * 60)
    );
    let message = `Number of your tries is finished try again later after ${timeNextOpt + 1} minute(s)`;
    // logger.error(`To update email or resend verification please try again later, ${responseBody.timeInSeconds}, ${responseBody.email}`, 400, 'send verification');
    return res.status(400).json({ message });
  }

  if (team.otp !== value.otp) {
    team.updateSubmitOtp();
    await team.save();
    return next(createError(400, "Invalid code"));
  }
  team.isVerified = true;
  team.otpRequestCounter = 0;
  team.otpSubmitCounter = 0;
  await team.save();



  team.isVerified = true;
  team.otpRequestCounter = 0;
  await team.save();

  // remove data from user
  team.otpRequestCounter =
    team.password =
    team.otp =
    team.updatedAt =
    undefined;

  let token = await securityModule.buildTicket(team);
  req.session.user_sid = { userId: team.userID, role: team.role };
  req.session.save();

  await securityModule.setCookies(req, res, token);

  return res.status(200).json({
    token,
    verified: true,
  });
});

module.exports = verify;
