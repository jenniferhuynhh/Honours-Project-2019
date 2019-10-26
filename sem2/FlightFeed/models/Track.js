var mongoose = require('mongoose');

var TrackSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		default: 'plane'
	},
	timestamp: {
		type: Number,
		required: true
	},
	trackId: {
		type: Number,
		required: true
	},
	eventType: {
		type: Number,
		required: true,
		min: 0,
		max: 2,
		default: 0
	},
	sensorId: {
		type: Number,
		required: true,
		default: 0
	},
	latitude: {
		type: Number,
		required: true
	},
	longitude: {
		type: Number,
		required: true
	},
	altitude: {
		type: Number,
		default: 0
	},
	speed: {
		type: Number,
		default: 0
	},
	course: {
		type: Number,
		default: 0
	},
	affiliation: {
		type: Number,
		min: 0,
		max: 3,
		default: 2
	},
	domain: {
		type: Number,
		min: 0,
		max: 3,
		default: 3
	},
	type: {
		type: String,
		default: 'jet'
	}
});

var ReplayTrack = mongoose.model('Track', TrackSchema, 'tracks');
module.exports = ReplayTrack;