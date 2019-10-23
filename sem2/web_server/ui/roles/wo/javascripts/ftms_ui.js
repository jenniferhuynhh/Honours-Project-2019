var FTMS_UI = (function() {
	//Public
	return {
		window_manager: null,
		event_manager: null,
		settings_manager: null,
		settings: null,
		track_manager: null,
		map_module: null,
		track_table_module: null,
		authorisation_approval_module: null,
		alert_module: null,
		messaging_module: null,
		header: null,

		//Initialises all modules and shows them
		init: function(layout) {
			
			this.event_manager = EventManager;
			this.event_manager.init(this);

			this.settings_manager = SettingsManager;
			this.settings_manager.init(this, ()=>{

				this.window_manager = WindowManager;
				this.window_manager.initialise(this, layout);

				this.track_manager = TrackManager;
				this.track_manager.init(this);

				this.map_module = MapModule;
				this.map_module.initialise(this);

				this.track_table_module = TrackTableModule;
				this.track_table_module.initialise(this);

				this.authorisation_approval_module = AuthorisationApprovalModule;
				this.authorisation_approval_module.initialise(this);

				this.settings = SettingsModule;
				this.settings.init(this);

				this.alert_module = AlertModule;
				this.alert_module.init(this);

				this.messaging_module = MessagingModule;
				this.messaging_module.initialise(this);

				this.header = Header;
				this.header.initialise(this);

				this.window_manager.showAll();

				this.track_manager.test();
			});
		}
	}
}());