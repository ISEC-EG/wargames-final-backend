const createError = require('http-errors')
const Email = require('../../../modules/email')
const Team = require('../team.model')

const {
  forgotPassword: forgotPasswordValidation
} = require('../team.validation')

async function forgotPassword (req, res, next) {
  try {
    const { error, value } = forgotPasswordValidation.validate(req.body)
    if (error)
      return res.status(400).json({ message: error.message.replace(/"/g, '') })

    const team = await Team.findOne({ email: value.email })

    if (!team)
      return next(createError(409, 'Team not found, enter a valid email'))

    if (team.forgotPasswordNextResetAt > Date.now()) {
      let time =
        (new Date(team.forgotPasswordNextResetAt) - Date.now()) / (1000 * 60)
      if (time >= 60) {
        let timeForget1 = Math.trunc(
          (new Date(team.forgotPasswordNextResetAt) - Date.now()) /
            (1000 * 60 * 60)
        )
        return next(
          createError(409, `Try again after a ${timeForget1 + 1} hour(s)`)
        )
      }
      let timeForget2 = Math.trunc(
        (new Date(team.forgotPasswordNextResetAt) - Date.now()) / (1000 * 60)
      )
      return next(
        createError(409, `Try again after a ${timeForget2 + 1} minutes`)
      )
    }

    if (team.otpNextResendAt > Date.now()) {
      let timeNextOpt = Math.trunc(
        (new Date(team.otpNextResendAt) - Date.now()) / (1000 * 60)
      )
      return next(
        createError(409, `Try again later after ${timeNextOpt + 1} minute(s)`)
      )
    }

    team.updateOtp()
    team.updateResetPasswordCounter()
    await team.save()

    await new Email(team, team.otp).sendPasswordReset()

    const token = team.signTempJWT()
    return res.status(200).json({ temp: token })
  } catch (error) {
    return res.status(500).send({ message: 'Internal server error' })
  }
}

module.exports = forgotPassword
