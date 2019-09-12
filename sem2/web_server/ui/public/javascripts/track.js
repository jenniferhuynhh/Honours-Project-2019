function Track(track_id, lat, long, alt, speed, course, affiliation, domain) {
	this.id = Number(track_id); //unique ID
	this.latitude = lat; //-34.912955 (Adelaide)
	this.longitude = long; //138.365660 (Adelaide)
	this.altitude = alt;
	this.speed = speed;
	this.course = course; //course in degrees
	this.type = "naval ship"; //type of track
	this.affiliation = affiliation; //affiliation of track (friendly, hostile, etc.)
	this.domain = domain; //domain of track (air, sea, land, subsurface)
}