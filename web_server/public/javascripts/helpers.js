//Generates random int between min/max (inclusive, exclusive respectively)
function randomInt(min, max) {
	return Math.floor((Math.random() * max) + min);
}

//Logs string to console with timestamp
function log(s) {
	console.log("[" + new Date().toTimeString().substr(0,8) + "] " + s);
}