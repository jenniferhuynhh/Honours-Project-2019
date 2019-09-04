var AlertModule = (function() {
	//Private
	var ftms_ui;
	var display;
	var socket = io();

	addAlert(alertJson){
		let alert = document.createElement("button");

		// Alert class makes it not look like a button, severity changes colour
		alert.setAttribute('class', `alert ${alertJson.severity}`);

		alert.value = alertJson.text;

		alert.addEventListener('click', function(){
			alert.classList.add('dull');
		});

		display.insertAdjacentElement("afterbegin", alert); // "afterbegin" = top, "beforeend" = bottom
	}

	//Public
	return {
		initialise: function(ftms) {
			//Link FTMS UI system
			ftms_ui = ftms;

			//Create div for alerts to sit in
			display = document.createElement('div');
			display.setAttribute('class', 'alert_module');

			//Append display to window
			ftms_ui.window_manager.appendToWindow('Alert Module', display);

			socket.on('alert', function(message){
				console.log('Got Alert:');
				console.log(message);
			});
		}
		// outputRandomAlert: function() {
		// 	display.innerHTML = alerts[randomInt(0, alerts.length)] + '<br>' + display.innerHTML;
		// }
	}
}());