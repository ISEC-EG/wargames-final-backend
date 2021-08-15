const Team = require('../team.model');
const { pagination: paginationSchema } = require('../team.validation');

async function dashboard(req, res) {
	try {
		let { error, value } = paginationSchema.validate(req.query, { stripUnknown: true });
		if (error) return res.status(400).json({ message: error.message.replace(/"/g, '') });

		if (!value.limitNo) value.limitNo = 20;
		if (!value.pageNo) value.limitNo = 0;

		const queryLimitNo = Number.parseInt(value.limitNo);
		const querySkipNo = Number.parseInt(value.pageNo) * queryLimitNo;

		let teams = await Team.find()
			.skip(querySkipNo)
			.limit(queryLimitNo);

		let count = await Team.find({ role: 'user', isVerified: true }).countDocuments();

		return res.status(200).json({ teams, count });
	} catch (err) {
		return res.status(500).json({ message: 'Internal server error' });
	}
}

module.exports = dashboard;
