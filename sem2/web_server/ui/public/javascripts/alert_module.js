var AlertModule = (function() {
	//Private
	var ftms_ui;
	var display;
	var alerts;
	var socket = io();

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

			socket.on('alert', function(message){
				console.log('Got Alert:');
				console.log(message);
			});
		},
		// outputRandomAlert: function() {
		// 	display.innerHTML = alerts[randomInt(0, alerts.length)] + '<br>' + display.innerHTML;
		// }
	}
}());