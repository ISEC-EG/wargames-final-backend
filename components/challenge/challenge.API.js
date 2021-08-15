const express = require('express');
const router = express.Router();

const Security = require('./../../security');
const POOL = require("./../../modules/queue")

const {
	createChallenge,
	updateChallenge,
	getChallenge,
	challengesByCat,
	getAllChallenges,
	downloadFile,
	submitFlag,
	removeChallenge,
	requestHint
} = require('./controllers');

router.post('/create-challenge-v01', Security.auth(['superadmin']), createChallenge);
router.patch('/challenge-v01/:challengeId', Security.auth(['superadmin']), updateChallenge);

router.get('/all', Security.auth(['superadmin', 'user']), getAllChallenges);
router.get('/:challengeId', Security.auth(['superadmin', 'user']), getChallenge);
router.get('/category/:cat', Security.auth(['superadmin', 'user']), challengesByCat);
router.get('/download/:name', Security.auth(['user']), downloadFile);

router.post("/answer/:challengeId", Security.auth(['user']), POOL.queue(submitFlag));
router.get("/hint/:challengeId", Security.auth(['user']), requestHint);

router.delete('/:challengeId', Security.auth(['superadmin']), removeChallenge);

module.exports = router;
