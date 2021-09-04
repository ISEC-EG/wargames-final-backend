const mongoose = require('mongoose')
const Mutex = require('async-mutex')

const mutex = new Mutex.Mutex() // creates a shared mutex instance

const Challenge = require('../challenge.model')
const Solution = require('../../team/solution.model')
const Team = require('../../team/team.model')
const { flag: flagValidation } = require('../challenge.validate')

const Socket = require('./../../../socket')

async function submitFlag(req, res) {
	const release = await mutex.acquire() // acquires access to the critical path
	try {
		if (!mongoose.Types.ObjectId.isValid(req.params.challengeId))
			return res.status(400).send({ message: 'Invalid Challenge' })

		const { error, value } = flagValidation.validate(req.body)
		if (error)
			return res.status(400).json({ message: error.message.replace(/"/g, '') })

		let team = await Team.findById(req.userData._id)
		if (!team)
			return res.status(401).json({ message: 'Unauthorized Team not found' })

		let challenge = await Challenge.findById(req.params.challengeId)
		if (!challenge)
			return res.status(429).json({ message: 'Challenge not found' })

		let solved = await Solution.findOne({
			challenge: mongoose.Types.ObjectId(req.params.challengeId),
			team: mongoose.Types.ObjectId(req.userData._id),
		})
		if (solved)
			return res
				.status(409)
				.json({ message: 'Challenge already solved before' })

		value.challengeName = challenge.title
		value.team = req.userData._id
		value.challenge = req.params.challengeId

		if (challenge.flag === value.flag) {
			value.points = challenge.points
			team.score += challenge.points
			team.scoreUpdateAt = Date.now()
			const [solution, teamSaved] = await Promise.all([
				Solution.create(value),
				team.save(),
			])
			// Socket.updateScore(team.score, team._id, solution);
			Socket.updateDashboard()
			return res.status(200).json({ message: 'Challenge solved', solved: true })
		}
		return res
			.status(400)
			.json({ message: 'Flag(answer) incorrect.. Try Again', solved: false })
	} catch (err) {
		console.log(err)
		return res.status(500).json({ message: 'Internal server error' })
	} finally {
		release() // completes the work on the critical path
	}
}

module.exports = submitFlag