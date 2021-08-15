
module.exports = {
	dbURI: process.env.MONGO_URI + process.env.MONGO_REWRITE,
	ORIGIN_CORS: process.env.ORIGIN_CORS.split(","),
	ticketValidationInDays: process.env.ticketValidationInDays,
	banDurationInHours: process.env.banDurationInHours,
	freeRetriesOnStrictRoutes: 5,
	AWSAccessKeyId: process.env.AWSAccessKeyId,
	AWSSecretKey: process.env.AWSSecretKey,
	BUCKET_NAME: process.env.BUCKET_NAME,
	SESSION_SECRET: process.env.SESSION_SECRET,
	timeBetweenPasswordResetsInHours: process.env.timeBetweenPasswordResetsInHours,
	maxLogins: process.env.maxLogins,
	TempToken: process.env.TEMP_TOKEN_SECRET,
	RedisHost: process.env.RedisHost,
	RedisPort: process.env.RedisPort,
	"maxTicketUsagePerHour": 6000,
	"foreignIpBlockInDays": 365,
	"scanBlockInDays": 15,
	tempTokenDurationInHours: process.env.tempTokenDurationInHours,
	"timeZone": "Africa/Cairo",
	email: {
		user: process.env.User_Email,
		pass: process.env.User_Password
	},
}