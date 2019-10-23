var SettingsManager = (function() {
	//Private
	var ftms_ui; //FTMS UI system this module is linked to
	var settings = {
		audio_on: false,
		dark_theme: true,
		colourblind: false,
		icon_sizing: 15,
		default_layout: ""
	}

	//Public
	return {
		init: function(ftms, callback) {
			//Link FTMS UI system
			ftms_ui = ftms;

			ftms_ui.event_manager.loadSettings(function(settings_data){
				if(settings_data){
					//if they do have settings
					settings = settings_data;
				}
				callback();
			});
		},
		
		saveSettings: function() {
			ftms_ui.event_manager.saveSettings(settings);
		},

		getSetting: function(setting) {
			return settings[setting];
		},

		changeSetting: function(setting, value) {
			settings[setting] = value;
			this.saveSettings();
		},

		toggleSetting: function(setting) {
			this.changeSetting(setting, !settings[setting]);
		}
	}
}());