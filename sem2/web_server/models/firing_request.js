var mongoose = require('mongoose');

var FiringRequestSchema = new mongoose.Schema({
	requestId: {
		type: Number,
		required: true
	},
	username: {
		type: String,
		required: true
	},
	timestamp: {
		type: Number,
		required: true
	},
	trackId: {
		type: Number,
		required: true,
		min: 0
	},
	weaponIds: {
		type: Array,
		required: true
	},
	status: {
		type: String,
		require: true
	}
});

var FiringRequest = mongoose.model('FiringRequest', FiringRequestSchema, "FiringRequest");
module.exports = FiringRequest;