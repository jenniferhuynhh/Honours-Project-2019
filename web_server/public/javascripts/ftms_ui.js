function FTMS_UI() {
	this.window_manager;
	this.simulator;
	this.map_module;
	this.track_table_module;
	this.classification_module;
	this.weapon_authorisation_module;
	this.alert_module;

	this.initialise = function() {
		this.window_manager = new WindowManager();
		this.window_manager.initialise(this);

		this.simulator = new Simulator();
		this.simulator.initialise(this);

		this.map_module = new MapModule();
		this.map_module.initialise(this);

		this.track_table_module = new TrackTableModule();
		this.track_table_module.initialise(this);

		this.classification_module = new ClassificationModule();
		this.classification_module.initialise(this);

		this.weapon_authorisation_module = new WeaponAuthorisationModule();
		this.weapon_authorisation_module.initialise(this);

		this.weapon_firing_module = new WeaponFiringModule();
		this.weapon_firing_module.initialise(this);

		this.alert_module = new AlertModule();
		this.alert_module.initialise(this);

		this.window_manager.showAll();
	}

	this.run = function() {
		this.simulator.run();
	}
}