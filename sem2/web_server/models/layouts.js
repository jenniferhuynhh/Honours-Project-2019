var mongoose = require('mongoose');

var UserLayoutsSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	layout: {
		type: String,
		required: true
	}
});

var UserLayouts = mongoose.model('UserLayouts', UserLayoutsSchema);
module.exports = UserLayouts;