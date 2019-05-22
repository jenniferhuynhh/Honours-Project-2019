function Simulator() {
	this.ftms_ui; //FTMS UI system this module is linked to
	this.iterations = 20000; //number of iterations to perform
	this.i = 0; //current iteration
	this.tick_rate = 0.5; //tick time in seconds
	this.tracks = new Map(); //Map of tracks, mapped to their unique ID
	this.socket = io();
	var self = this

	this.socket.on('track', function(message){
		console.log(`[${new Date().toTimeString().substr(0,8)}] Got message from server:\n${message}`);
		if (message[0] == "{"){
			var jsonTrack = JSON.parse(message);
			var id = jsonTrack["track_id"]["$numberInt"];
			var lat = jsonTrack["latitude"]["$numberDouble"];
			var long = jsonTrack["longitude"]["$numberDouble"];
			var alt = jsonTrack["altitude"]["$numberDouble"];
			var speed = jsonTrack["speed"]["$numberDouble"];
			var course = jsonTrack["course"]["$numberDouble"];
			var aff = jsonTrack["state"];
			var t = self.tracks.get(id);
			

			if (t !== undefined){
				t.latitude = lat;
				t.longitude = long;
				t.altitude = alt;
				if (aff != "UNKNOWN")
					t.affiliation = aff.toLowerCase();
			}
			else{
				t = new Track(id, lat, long, alt, speed, course, aff.toLowerCase(), "sea");
				self.tracks.set(id, t);
			}

			self.ftms_ui.map_module.paintTrack(t);
		}
	});

	//Initialises renderer and populates tracks
	this.initialise = function(ftms_ui) {
		log("Simulator initialising...");

		//Link FTMS UI system
		this.ftms_ui = ftms_ui;
		//Create initial tracks
		/*this.tracks.push(new Track(-34.912955, 138.365660, "hostile"));
		this.tracks.push(new Track(-34.912936, 138.365650, "friendly"));
		this.tracks.push(new Track(-34.912915, 138.365620, "hostile"));
		this.tracks.push(new Track(-34.912975, 138.365680, "hostile"));
		this.tracks.push(new Track(-34.912980, 138.365635, "friendly"));*/
		
		/*this.tracks.push(new Track(-34.912955, 138.365660, "hostile"));
		this.tracks.push(new Track(-34.912936, 138.365650, "friendly"));
		this.tracks.push(new Track(-34.912915, 138.365620, "hostile"));
		this.tracks.push(new Track(-34.912975, 138.365680, "hostile"));
		this.tracks.push(new Track(-34.912980, 138.365635, "friendly"));*/
		
		// this.tracks.push(new Track(-34.910000, 138.455, "friendly", "sea"));
		// this.tracks.push(new Track(-34.921225, 138.42, "hostile", "subsurface"));
		// this.tracks.push(new Track(-34.921254, 138.46, "friendly", "air"));
		// this.tracks.push(new Track(-34.921240, 138.45, "friendly", "land"));
		// this.tracks.push(new Track(-34.931000, 138.43, "hostile", "sea"));

		log("Simulator initialised");
	};

	//Begins the tick cycle
	this.run = function() {
		log("Simulator running...");
		//Begin iterations
		this.tick();
	};

	//Recursive function that drives the simulator
	this.tick = function tick() {
		var self = this; //Store scope (https://stackoverflow.com/q/45147661)

		//10% chance for a new alert to appear
		if(Math.random() < 0.10) {
			this.ftms_ui.alert_module.outputRandomAlert();
		}

		//10% chance for track to disappear
		/*if(Math.random() < 0.01) {
			var min = 1000;
			for(var i = 0; i < this.tracks.length; i++) {
				if(this.tracks[i].id < min) {
					min = this.tracks[i].id;
				}
			}
			this.removeTrack(randomInt(min, this.tracks.length));
			this.ftms_ui.track_table_module.updateTrackTable();
		}*/

		//Tell all tracks to move once
		for(var i = 0; i < this.tracks.length; i++) {
			this.tracks[i].go();
		}

		//Render new track positions
		this.ftms_ui.map_module.render();

		//Display data of new track positions
		this.ftms_ui.track_table_module.updateTrackTable();

		//Repeat every 'tick_rate' seconds iteratively
		if(++this.i == this.iterations) return; //Exit case
		setTimeout(function() {
			self.tick();
		}, this.tick_rate * 1000);
	}

	//Returns track with matching ID
	this.getTrack = function(id) {
		return this.tracks.get(id);
	}

	//Removes a track from the track array by ID
	this.removeTrack = function(id) {
		this.tracks.delete(id);
	}
};