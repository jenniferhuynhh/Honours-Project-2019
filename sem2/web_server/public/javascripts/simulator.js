function Simulator() {
	this.ftms_ui; //FTMS UI system this module is linked to
	this.iterations = 20000; //number of iterations to perform
	this.i = 0; //current iteration
	this.tick_rate = 0.5; //tick time in seconds
	this.tracks = new Map(); //Map of tracks, mapped to their unique ID
	this.socket = io();
	var self = this;

	//Initialises renderer and populates tracks
	this.initialise = function(ftms_ui) {
		log("Simulator initialising...");

		//Link FTMS UI system
		this.ftms_ui = ftms_ui;

		log("Simulator initialised");
	};

	this.test = function() {

		var t1 = new Track(123, 26.576489, 56.423728, 0, 20, 270, "friendly", "sea");
		this.tracks.set(t1.id, t1);
		this.ftms_ui.map_module.paintTrack(t1);

		//Display data of new track positions
		this.ftms_ui.track_table_module.updateTrackTable();

	}

	this.socket.on('track', function(message){
		if (message[0] == "{"){
			var jsonTrack = JSON.parse(message);
			var id = jsonTrack.trackId;
			var lat = jsonTrack.latitude;
			var long = jsonTrack.longitude;
			var alt = jsonTrack.altitude;
			var speed = jsonTrack.speed;
			var course = jsonTrack.course;
			var aff = jsonTrack.state;
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

			//Tells the map to draw the track
			self.ftms_ui.map_module.paintTrack(t);

			//Display data of new track positions
			self.ftms_ui.track_table_module.updateTrackTable();
		}
	});

	//Begins the tick cycle
	this.run = function() {
		log("Simulator running...");
		//Begin iterations
		this.tick();
	};

	//Recursive function that drives the simulator
	this.tick = function tick() {

		//10% chance for a new alert to appear
		if(Math.random() < 0.10) {
			this.ftms_ui.alert_module.outputRandomAlert();
		}

		//Repeat every 'tick_rate' seconds iteratively
		if(++this.i == this.iterations) return; //Exit case
		setTimeout(function() {
			self.tick();
		}, this.tick_rate * 1000);
	}

	//Returns track with matching ID
	this.getTrack = function(id) {
		return this.tracks.get(Number(id));
	}

	//Removes a track from the track array by ID
	this.removeTrack = function(id) {
		this.tracks.delete(id);
	}
};