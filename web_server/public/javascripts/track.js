function Track(lat, long, affiliation) {
	this.id = track_id++; //unique, autoincrementing ID
	this.latitude = lat; //-34.912955
	this.longitude = long; //138.365660
	this.speed = ((25000/60/60)/(1000000))*0.85; //25km/h (6.94m/s) in decimal degrees (geographic coordinates)
	this.course = randomInt(0, 360); //course in degrees
	this.type = "ship"; //type of ship
	this.affiliation = affiliation; //affiliation of ship (friendly, hostile, etc.)
	this.route = "forward"; //current state of travel (straight/turning)
	this.turn_count = 0; //used to limit the time a ship can turn

	//Moves a track forward according to its course and speed
	this.forward = function() {
		this.latitude += this.speed * Math.cos(this.course * (Math.PI/180)) * 30; //convert to radians
		this.longitude += this.speed * Math.sin(this.course * (Math.PI/180)) * 20;
	}

	//Shifts a track's course
	this.turn = function() {
		var turn_degrees = 60; //Degrees a ship should turn
		if(this.route == "forward") { //If previously moving forward, begin a turn
			if(Math.random() < 0.50) { //50% chance to turn left
				this.route = "left";
			} else { //50% chance to turn right
				this.route = "right";
			}
		}

		if(Math.random() < 0.80) { //80% chance to continue turn
			//Check if turn has been at most 270 degrees
			if(++this.turn_count >= 270/turn_degrees) {
				this.route = "forward";
				this.turn_count = 0;
				this.forward();
				return;
			}

			if(this.route == "left") { //Continue current turn
				this.course -= turn_degrees;
			} else { //If route = right
				this.course += turn_degrees;
			}

			//If new course is out of 0-360 range, loop back
			if(this.course < 0) this.course += 360;
			if(this.course > 360) this.course -= 360;
		} else { //20% chance to go straight again
			this.route = "forward";
			this.turn_count = 0;
		}

		//Move track one movement in new direction
		this.forward();
	}

	//Begin a movement
	this.go = function() {
		if(this.route == "forward") { //If already moving forward
			if(Math.random() < 0.90) { //90% to continue forward
				this.forward();
			} else { //10% chance to begin turn
				this.turn();
			}
		} else { //Otherwise continue existing turn
			this.turn();
		}
	}
}

var track_id = 0; //track unique ID counter