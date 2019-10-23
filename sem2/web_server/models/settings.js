var mongoose = require('mongoose');

var UserSettingsSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	settings: {
		audio_on: {
			type: Boolean,
			required: true
		},
		dark_theme: {
			type: Boolean,
			required: true
		},
		colourblind: {
			type: Boolean,
			required: true
		},
		icon_sizing: {
			type: Number,
			required: true,
			min: 5,
			max: 30
		},
		default_layout: {
			type: String
		}
	}
});

var UserSettings = mongoose.model('UserSettings', UserSettingsSchema, "userSettings");
module.exports = UserSettings;