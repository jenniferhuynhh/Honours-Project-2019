function AlertModule() {
	this.ftms_ui;
	this.display;
	this.alerts;

	//Create display and populate alerts array
	this.initialise = function(ftms_ui) {
		//Link FTMS UI system
		this.ftms_ui = ftms_ui;

		//Create div for alerts to sit in
		this.display = document.createElement('div');
		this.display.setAttribute('class', 'alert_module');

		//Possible alerts to be shown (for simulation)
		this.alerts = ['Incoming missle!', 'Hostile track moving.', 'Unknown track.', 'Friendly track.', 'Hostile track.'];

		//Append display to window
		this.ftms_ui.window_manager.appendToWindow('Alert Module', this.display);
	}

	//Appends a random alert to the top of the alert module display
	this.outputRandomAlert = function() {
		this.display.innerHTML = this.alerts[randomInt(0, this.alerts.length)] + '<br>' + this.display.innerHTML;
	}
}