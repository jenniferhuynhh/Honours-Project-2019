var SettingsManager = (function() {
	//Private
	var ftms_ui; //FTMS UI system this module is linked to
	var listeners;
	var settings;

	//Public
	return {
		init: function(ftms, callback) {
			//Link FTMS UI system
			ftms_ui = ftms;

			listeners = {}; //Listeners can listen to the name of any setting, will be called when value changes
			settings = {
				audio_on: false,
				dark_theme: true,
				colourblind: false,
				icon_sizing: 15,
				default_layout: "",
				ownship_id: 1020
			}

			//Creates listener channel for each setting
			for(var setting in settings) listeners[setting] = [];

			this.addEventListener("dark_theme", () => this.decideTheme());
			this.addEventListener("colourblind", () => this.decideColourblind());

			//Load user settings from database
			ftms_ui.event_manager.loadSettings(settings_data => {
				if(settings_data){
					//if they do have settings
					settings = settings_data;
				}
				this.decideTheme();
				this.decideColourblind();
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
			this.callListeners(setting, value);
			this.saveSettings();
		},

		toggleSetting: function(setting) {
			this.changeSetting(setting, !settings[setting]);
		},

		decideTheme() {
			var themes = {
				dark: "public/javascripts/libraries/GoldenLayout1.5.9/goldenlayout-dark-theme.css",
				light: "public/javascripts/libraries/GoldenLayout1.5.9/goldenlayout-light-theme.css"
			}
			var link = document.getElementById("gl-theme");
			if(settings.dark_theme) link.href = themes.dark;
			else link.href = themes.light;
		},

		decideColourblind() {
			var modes = {
				normal: "public/stylesheets/main.css",
				colourblind: "public/stylesheets/colourblind.css"
			}
			var link = document.getElementById("normal-mode");
			if(settings.colourblind) link.href = modes.colourblind;
			else link.href = modes.normal;
		},

		addEventListener: function(event, func) {
			listeners[event].push(func);
		},

		callListeners: function(event, value) {
			for(var i = 0; i < listeners[event].length; i++) {
				listeners[event][i](value);
			}
		}
	}
}());