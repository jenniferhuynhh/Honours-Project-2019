//Generates random int between min/max (inclusive)
function randomInt(min, max) {
	return Math.floor((Math.random() * max + 1) + min);
}

//Logs string to console with timestamp
function log(s) {
	console.log("[" + new Date().toTimeString().substr(0,8) + "] " + s);
}