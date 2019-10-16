var mongoose = require('mongoose');

var ReplayTrackSchema = new mongoose.Schema({
	//name: String,
	timestamp: Number,
	trackId: {
		type: Number,
		required: true
	},
	latitude: Number,
	longitude: Number,
	altitude: Number,
	speed: Number,
	course: Number,
	type: String,
	affiliation: String,
	domain: String
});

var ReplayTrack = mongoose.model('ReplayTrack', ReplayTrackSchema);
module.exports = ReplayTrack;