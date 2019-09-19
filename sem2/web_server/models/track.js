var mongoose = require('mongoose');

var TrackSchema = new mongoose.Schema({
	//name: String,
	//timestamp: Number,
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

var Track = mongoose.model('Track', TrackSchema, 'sysTrackUpdates');
module.exports = Track;