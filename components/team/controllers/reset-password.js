/**
 * @description      :
 * @author           : dev1
 * @group            :
 * @created          : 01/06/2021 - 12:41:59
 *
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 01/06/2021
 * - Author          : dev1
 * - Modification    :
 **/
const Team = require('../team.model')

const { resetPassword: resetPasswordValidation } = require('../team.validation')

async function resetPassword (req, res, next) {
  try {
    const { error, value } = resetPasswordValidation.validate(req.body)

    if (error)
      return res.status(400).json({ message: error.message.replace(/"/g, '') })

    const team = await Team.findById(req.userData._id)
    if (!team)
      return res.status(409).json({ message: 'Team not found' })

    team.password = value.password
    team.otpRequestCounter = 0
    await team.save()
    return res.status(200).json({ message: 'Password reset successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = resetPassword
