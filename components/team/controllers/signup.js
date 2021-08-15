const Team = require('../team.model')
const catchAsync = require('../../../utils/catchAsync')
const Security = require('./../../../security')
const { signup: signupSchema } = require('../team.validation')
const Secret = require("./../secret.model");

signup = catchAsync(async (req, res) => {
  try {
    const { error, value } = signupSchema.validate(req.body)
    if (error)
      return res.status(400).json({ message: error.message.replace(/"/g, '') })

    let team = await Team.findOne().or([
      { email: value.email },
      { name: value.name }
    ])

    if (team && team.email === value.email)
      return res
        .status(409)
        .json({ message: 'Email already registered before', status: 409 })

    if (team && team.name === value.name)
      return res.status(409).json({ message: 'Team name is used', status: 409 })

    const isSecretExists = await Secret.findOne({ key: value.secret });
    if (!isSecretExists) return res.status(400).json({ message: "Secret key not valid" });

    team = await Team.create(value)
    await Secret.findOneAndDelete({ key: value.secret });

    const token = await Security.buildTicket(team);

    return res.status(200).send({ token })
  } catch (error) {
    console.log(error.message)
    return res.status(500).send({ message: 'Internal server error' })
  }
})

module.exports = signup
