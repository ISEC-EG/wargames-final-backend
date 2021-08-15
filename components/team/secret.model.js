const mongoose = require('mongoose');

const Secret = new mongoose.Schema({

	key: { type: String, required: true, unique: true},
  },
  { usePushEach: true }
);

module.exports = mongoose.model('Secret', Secret);