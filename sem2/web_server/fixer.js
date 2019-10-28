// The purpose of this script is to drop database collections that may contain 
// invalid values when a schema, library or code is altered. If the UI appears 
// to not load due to a database related error, run this script using 'node fixer.js'
var collections_to_drop = ['userSettings', 'userlayouts'];

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/tmsdb', {useNewUrlParser: true}, () => {
	function drop(i) {
		mongoose.connection.db.dropCollection(collections_to_drop[i], err => {
			if(err) console.log(collections_to_drop[i] + " not found.");
			else console.log(collections_to_drop[i] + " dropped.");

			if(i+1 < collections_to_drop.length) drop(i+1);
		});
	}
	drop(0);
});