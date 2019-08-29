var Simulator = (function() {
	//Private
	var ftms_ui; //FTMS UI system this module is linked to
	var iterations = 20000; //number of iterations to perform
	var i = 0; //current iteration
	var tick_rate = 0.5; //tick time in seconds
	var socket = io();

	//Public
	return {
		tracks: new Map(), //Map of tracks, mapped to their unique ID
		//Initialises renderer and populates tracks
		initialise: function(ftms) {
			log("Simulator initialising...");

			//Link FTMS UI system
			ftms_ui = ftms;

			socket.on('track', function(message){
				console.log(message);
				if (message[0] == "{") {
					var jsonTrack = JSON.parse(message);
					var id = jsonTrack.trackId;
					var lat = jsonTrack.latitude;
					var long = jsonTrack.longitude;
					var alt = jsonTrack.altitude;
					var speed = jsonTrack.speed;
					var course = jsonTrack.course;
					var aff = jsonTrack.state;
					var t = this.tracks.get(id);

					if (t !== undefined){
						t.latitude = lat;
						t.longitude = long;
						t.altitude = alt;
						if (aff != "UNKNOWN")
							t.affiliation = aff.toLowerCase();
					}
					else{
						t = new Track(id, lat, long, alt, speed, course, aff.toLowerCase(), "sea");
						this.tracks.set(id, t);
					}

					//Tells the map to draw the track
					ftms_ui.map_module.paintTrack(t);

					//Display data of new track positions
					ftms_ui.track_table_module.updateTrackTable();
				}
			});

			log("Simulator initialised");
		},
		test: function() {

			var t1 = new Track(123, 26.576489, 56.423728, 0, 20, 270, "friendly", "sea");
			this.tracks.set(t1.id, t1);
			ftms_ui.map_module.paintTrack(t1);

			//Display data of new track positions
			ftms_ui.track_table_module.updateTrackTable();

		},
		//Begins the tick cycle
		run: function() {
			log("Simulator running...");
			//Begin iterations
			this.tick();
		},
		//Recursive function that drives the simulator
		tick: function() {

			//10% chance for a new alert to appear
			if(Math.random() < 0.10) {
				ftms_ui.alert_module.outputRandomAlert();
			}

			//Repeat every 'tick_rate' seconds iteratively
			var self = this;
			if(++i == iterations) return; //Exit case
			setTimeout(function() {
				self.tick();
			}, tick_rate * 1000);
		},
		//Returns track with matching ID
		getTrack: function(id) {
			return this.tracks.get(Number(id));
		},
		//Removes a track from the track array by ID
		removeTrack: function(id) {
			this.tracks.delete(Number(id));
		}
	}
}());