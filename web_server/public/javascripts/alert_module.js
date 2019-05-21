function AlertModule() {

	this.ftms_ui;
	this.alerts;
	this.display;

	this.initialise = function(ftms_ui){
		//Link FTMS UI system
		this.ftms_ui = ftms_ui;

		this.alerts = ['Incoming missle!', 'Hostile track moving.', 'Unknown track.', 'Friendly track.', 'Hostile track.'];

		this.display = document.createElement('p');

		//Show module
		this.ftms_ui.window_manager.appendToWindow(this.display, 1, 0);

	}

	this.showRandomAlerts = function(){

		var oldAlerts = this.display.innerHTML;
		this.display.innerHTML = this.alerts[randomInt(0,this.alerts.length)] + '<br>';
		this.display.innerHTML += oldAlerts;
	}
}