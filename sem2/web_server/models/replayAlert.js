var mongoose = require('mongoose');

var ReplayAlertSchema = new mongoose.Schema({
	timestamp: Number,
	severity: String,
	text: String
});

var ReplayAlert = mongoose.model('ReplayAlert', ReplayAlertSchema);
module.exports = ReplayAlert;