var AlertModule = (function() {
	// Private
	var ftms_ui;
	var display;
	var showAcknowledgedDiv;
	var showAcknowledgedChk;
	var alert_sound;

	function showAcknowledged(){
		var children = display.childNodes;

		for (var i = children.length - 1; i >= 0; i--) {
			if (children[i] != showAcknowledgedDiv){
				if (children[i].classList.contains('dull')){
					children[i].classList.toggle('hidden');
				}
			}				
		}
	}

	// Public
	return {
		init: function(ftms) {
			// Link FTMS UI system
			ftms_ui = ftms;

			// Create div for alerts to sit in
			display = document.createElement('div');
			display.classList.add('alert_module');

			// Adding audio
			alert_sound = new Audio('public/resources/alerts.mp3');

			// Create div to put "Show Acknowledged" text and checkbox
			showAcknowledgedDiv = document.createElement('div');
			showAcknowledgedDiv.style.height = "1.5rem";
			showAcknowledgedDiv.style.width = "100%";

			showAcknowledgedChk = document.createElement('input');
			showAcknowledgedChk.setAttribute("type", "checkbox");
			showAcknowledgedChk.addEventListener("click", showAcknowledged);

			showAcknowledgedDiv.appendChild(showAcknowledgedChk);
			showAcknowledgedDiv.appendChild(document.createTextNode("Show Acknowledged Alerts"));
			display.appendChild(showAcknowledgedDiv);

			// Append display to window
			ftms_ui.window_manager.appendToWindow('Alert Module', display);
		},

		addAlert: function(alertJson){
			let alert = document.createElement("button");

			// Alert class makes it not look like a button, severity changes colour
			alert.setAttribute('class', `alert ${alertJson.severity}`);

			alert.innerHTML = alertJson.text;

			alert.addEventListener('click', function(){
				if (showAcknowledgedChk.checked){
					if (alert.classList.contains('dull'))
						alert.remove();
				}else{
					alert.classList.add('hidden');
				}

				alert.classList.add('dull');
			});

			if(ftms_ui.settings_manager.getSetting("audio_on")) alert_sound.play();

			showAcknowledgedDiv.insertAdjacentElement("afterend", alert);
		}
	}
}());