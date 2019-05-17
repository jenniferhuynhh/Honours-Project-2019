function FTMS_UI() {
	this.display_id = "ftms_ui"; //element the UI should display windows in
	this.window_manager;
	this.simulator;
	this.map_module;
	this.track_table_module;
	this.alert_module;
	this.classification_module;

	this.initialise = function() {
		//this.window_manager = new WindowManager();
		this.window_manager = new WindowManagerGoldenLayout();
		this.window_manager.initialise(this);

		this.simulator = new Simulator();
		this.simulator.initialise(this);

		this.map_module = new MapModule();
		this.map_module.initialise(this);

		/*this.track_table_module = new TrackTableModule();
		this.track_table_module.initialise(this);

		this.alert_module = new AlertModule();
		this.alert_module.initialise(this);

		this.classification_module = new ClassificationModule();
		this.classification_module.initialise(this);
	}

	this.run = function() {
		//this.simulator.run();
	}
}