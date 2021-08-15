 const createError = require('http-errors');

const Team = require('../team.model');
const { updatePassword: updatePasswordSchema } = require('../team.validation');
const catchAsync = require('../../../utils/catchAsync');

updatePassword = catchAsync(async (req, res, next) => {
  const { error, value } = updatePasswordSchema.validate(req.body)
  if (error)
    return res.status(400).json({ message: error.message.replace(/"/g, '') })

  const team = await Team.findOne().byID(req.userData._id);
  if (!team) return next(createError(401, 'Unauthorized team not exists'))

  const isPasswordValid = await team.isPasswordValid(req.body.oldPassword)
  if (!isPasswordValid) return next(createError(409, 'Old password incorrect'))

  if (value.oldPassword === value.newPassword)
    return next(
      createError(409, 'New password must not be the same as old password')
    )

  team.password = value.newPassword
  await team.save()
  return res.status(200).json({ message: 'Password Updated Successfully' })
})

module.exports = updatePassword
