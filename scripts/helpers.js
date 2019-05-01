//Generates random int between min/max (inclusive)
function randomInt(min, max) {
	return Math.floor((Math.random() * max + 1) + min);
}

//Logs string to console with timestamp
function log(s) {
	console.log("[" + new Date().toTimeString().substr(0,8) + "] " + s);
}

//Darkens an rgb colour
function darken(colour) {
	rgb = colour.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	for(var i = 0; i < rgb.length; i++) rgb[i] *= 0.5;
	return "rgb(" + rgb[1] + "," + rgb[2] + "," + rgb[3] + ")";
}