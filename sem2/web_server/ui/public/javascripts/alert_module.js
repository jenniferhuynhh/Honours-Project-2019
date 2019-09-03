var AlertModule = (function() {
	//Private
	var ftms_ui;
	var display;
	var alerts;

	//Public
	return {
		initialise: function(ftms) {
			//Link FTMS UI system
			ftms_ui = ftms;

			//Create div for alerts to sit in
			display = document.createElement('div');
			display.setAttribute('class', 'alert_module');

			//Possible alerts to be shown (for simulation)
			alerts = ['Incoming missle!', 'Hostile track moving.', 'Unknown track.', 'Friendly track.', 'Hostile track.'];

			//Append display to window
			ftms_ui.window_manager.appendToWindow('Alert Module', display);

			this.tick();
		},

		//Recursive function that simulates alerts
		tick: function() {

			//10% chance for a new alert to appear
			if(Math.random() < 0.20) {
				this.outputRandomAlert();
			}

			var self = this;
			setTimeout(function() {
				self.tick();
			}, 1000);
		},

		outputRandomAlert: function() {
			display.innerHTML = alerts[randomInt(0, alerts.length)] + '<br>' + display.innerHTML;
		}
	}
}());