function FTMS_UI() {
	this.window_manager;
	this.simulator;
	this.map_module;
	this.track_table_module;
	this.classification_module;
	this.weapon_authorisation_module;
	this.alert_module;
	this.messaging_module;

	this.initialise = function() {
		this.window_manager = WindowManager;
		this.window_manager.initialise(this);

		this.simulator = new Simulator();
		this.simulator.initialise(this);

		this.map_module = MapModule;
		this.map_module.initialise(this);

		this.track_table_module = new TrackTableModule();
		this.track_table_module.initialise(this);

		this.classification_module = ClassificationModule;
		this.classification_module.initialise(this);

		this.weapon_authorisation_module = WeaponAuthorisationModule;
		this.weapon_authorisation_module.initialise(this);

		this.weapon_firing_module = WeaponFiringModule;
		this.weapon_firing_module.initialise(this);

		this.alert_module = AlertModule;
		this.alert_module.initialise(this);

		this.messaging_module = MessagingModule;
		this.messaging_module.initialise(this);

		this.window_manager.showAll();

		this.simulator.test();
	}

	this.run = function() {
		this.simulator.run();
	}
}