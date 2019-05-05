function Simulator() {
	this.iterations = 20000; //number of iterations to perform
	this.i = 0; //current iteration
	this.tick_rate = 1; //tick time in seconds
	this.tracks = []; //array of tracks the field should display
	this.renderer; //the renderer linked to this sim

	//Initialises renderer and populates tracks
	this.initialise = function() {
		log("Simulator initialising...");

		//Create initial tracks
		this.tracks.push(new Track(-34.912955, 138.365660, "hostile"));
		this.tracks.push(new Track(-34.912936, 138.365650, "friendly"));
		this.tracks.push(new Track(-34.912915, 138.365620, "hostile"));
		this.tracks.push(new Track(-34.912975, 138.365680, "hostile"));
		this.tracks.push(new Track(-34.912980, 138.365635, "friendly"));

		//Create and link renderer
		this.renderer = new Renderer();
		this.renderer.initialise(this);
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

		//Render new track positions
		this.renderer.render();

		//Display data of new track positions
		this.renderer.updateTrackTable();

		//Repeat every 'tick_rate' seconds
		if(++this.i == this.iterations) return; //Exit case
		setTimeout(function() {
			self.tick();
		}, this.tick_rate * 1000);
	}
};