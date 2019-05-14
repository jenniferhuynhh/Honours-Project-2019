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
		/*this.tracks.push(new Track(-34.912955, 138.365660, "hostile"));
		this.tracks.push(new Track(-34.912936, 138.365650, "friendly"));
		this.tracks.push(new Track(-34.912915, 138.365620, "hostile"));
		this.tracks.push(new Track(-34.912975, 138.365680, "hostile"));
		this.tracks.push(new Track(-34.912980, 138.365635, "friendly"));*/
		this.tracks.push(new Track(-34.910000, 138.455, "friendly"));
		this.tracks.push(new Track(-34.921225, 138.42, "hostile"));
		this.tracks.push(new Track(-34.921254, 138.46, "friendly"));
		this.tracks.push(new Track(-34.921240, 138.45, "friendly"));
		this.tracks.push(new Track(-34.931000, 138.43, "hostile"));
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

		//Tell all tracks to move once
		for(var i = 0; i < this.tracks.length; i++) {
			this.tracks[i].go();
		}

		//10% chance for a new alert to appear
		if(Math.random() < 0.10) {
			this.ftms_ui.alert_module.showRandomAlerts();
		}

		//Render new track positions
		this.ftms_ui.renderer.render();

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
};