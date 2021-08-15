const createError = require("http-errors");

const Team = require("../team.model");
const { login: loginSchema } = require("../team.validation");
const securityModule = require("../../../security");
const catchAsync = require("../../../utils/catchAsync");
const Config = require("../../../config");

login = catchAsync(async (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ message: error.message.replace(/"/g, ""), status: 400 });

  const team = await Team.findOne()
    .byEmail(value.email)
    .select("email password isVerified userID role _id");

  if (!team) return next(createError(401, "Invalid email or password"));
  const isPasswordValid = await team.isPasswordValid(value.password);
  if (!isPasswordValid)
    return next(createError(401, "Invalid email or password"));

  // if (!team.isVerified)
  //   return res.status(201).json({
  //     temp: team.signTempJWT(),
  //     verified: false,
  //     message: "Email  not verified please check email address",
  //   });

  let token = await securityModule.buildTicket(team);
  req.session.user_sid = { userId: team.userID, role: team.role };
  req.session.save();

  await securityModule.setCookies(req, res, token);

  return res.status(200).json({
    token
  });
});

module.exports = login;
