var mongoose = require('mongoose');

var FiringRequestSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	trackId: {
		type: Number,
		required: true,
		min: 0
	},
	weapon: {
		type: Array,
		required: true
	},
	state: {
		type: String,
		require: true
	}
});

var FiringRequests = mongoose.model('FiringRequests', FiringRequestSchema);
module.exports = FiringRequests;