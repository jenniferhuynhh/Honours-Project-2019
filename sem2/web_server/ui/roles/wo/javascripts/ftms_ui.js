var FTMS_UI = (function(){
	//Public
	return {
		window_manager: null,
		simulator: null,
		map_module: null,
		track_table_module: null,
		weapon_authorisation_module: null,
		weapon_firing_module: null,
		alert_module: null,
		messaging_module: null,
		header: null,

		initialise: function() {
			this.window_manager = WindowManager;
			this.window_manager.initialise(this);

			this.simulator = Simulator;
			this.simulator.initialise(this);

			this.map_module = MapModule;
			this.map_module.initialise(this);

			this.track_table_module = TrackTableModule;
			this.track_table_module.initialise(this);

			this.weapon_authorisation_module = WeaponAuthorisationModule;
			this.weapon_authorisation_module.initialise(this);

			this.weapon_firing_module = WeaponFiringModule;
			this.weapon_firing_module.initialise(this);

			this.alert_module = AlertModule;
			this.alert_module.initialise(this);

			this.messaging_module = MessagingModule;
			this.messaging_module.initialise(this);

			this.header = Header;
			this.header.initialise(this);

			this.window_manager.showAll();

			this.simulator.test();
		},

		run: function() {
			this.simulator.run();
		}
	}
}());