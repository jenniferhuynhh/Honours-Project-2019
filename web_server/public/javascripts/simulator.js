function Simulator() {
	this.ftms_ui; //FTMS UI system this module is linked to
	this.iterations = 20000; //number of iterations to perform
	this.i = 0; //current iteration
	this.tick_rate = 0.5; //tick time in seconds
	this.tracks = []; //array of tracks the field should display

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
		/*this.tracks.push(new Track(-34.912955, 138.365660, "hostile"));*/
		/*this.tracks.push(new Track(-34.912936, 138.5, "friendly", "land"));
		this.tracks.push(new Track(-34.912915, 138.56, "unknown", "land"));
		this.tracks.push(new Track(-34.9, 138.53, "unknown", "air"));
		this.tracks.push(new Track(-34.941000, 138.53, "neutral", "subsurface"));*/
		this.tracks.push(new Track(-34.850000, 138.455, "unknown", "sea"));
		this.tracks.push(new Track(-34.921225, 138.42, "unknown", "subsurface"));
		this.tracks.push(new Track(-34.900000, 138.46, "unknown", "air"));
		this.tracks.push(new Track(-34.941240, 138.47, "unknown", "land"));
		this.tracks.push(new Track(-34.961000, 138.43, "hostile", "sea"));
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
		for(var i = 0; i < this.tracks.length; i++) {
			if(this.tracks[i].id == id) return this.tracks[i];
		}
	}

	//Removes a track from the track array by ID
	this.removeTrack = function(id) {
		for(var i = 0; i < this.tracks.length; i++) {
			if(this.tracks[i].id == id) {
				this.ftms_ui.map_module.eraseTrack(id);
				this.tracks.splice(i, 1);
				return;
			}
		}
	}
};