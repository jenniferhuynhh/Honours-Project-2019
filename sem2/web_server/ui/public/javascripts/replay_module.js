var ReplayModule = (function() {
	// Private
	var ftms_ui;
	var display;
	var replaySwitch;

	function dateTimeChange(start, end, label){
		// Update Cesium Timeline here
	}

	// Public
	return {
		init: function(ftms) {
			// Link FTMS UI system
			ftms_ui = ftms;

			// Create div for replay controls to sit in
			display = document.createElement('div');
			display.classList.add('replay_module');

			// Create replay controls
			// Switch and Labels
			var switchDiv = document.createElement('div');
			switchDiv.id = "switchDiv";
			display.appendChild(switchDiv);

			var leftLabel = document.createElement('h1');
			leftLabel.innerHTML = "Off";
			switchDiv.appendChild(leftLabel);

			var switchBox = document.createElement('label');
			switchBox.classList.add('switchBox');
			switchDiv.appendChild(switchBox);

			replaySwitch = document.createElement('input');
			replaySwitch.setAttribute('type','checkbox');
			switchBox.appendChild(replaySwitch);

			var sliderCircle = document.createElement('span');
			sliderCircle.classList.add('slider', 'round');
			switchBox.appendChild(sliderCircle);

			var rightLabel = document.createElement('h1');
			rightLabel.innerHTML = "On";
			switchDiv.appendChild(rightLabel);

			// Start/End Inputs
			var dateTimeDiv = document.createElement('div');
			dateTimeDiv.style.textAlign = "center";
			dateTimeDiv.style.color = "white";
			display.appendChild(dateTimeDiv);

			var dateTimeLabel = document.createElement('h2');
			dateTimeLabel.innerHTML = "Start & End";
			dateTimeDiv.appendChild(dateTimeLabel);

			var dateTimeInput = document.createElement('input');
			dateTimeInput.id = 'replayDateTimeInput';
			dateTimeInput.setAttribute('type','text');
			dateTimeDiv.appendChild(dateTimeInput);

			jQuery(dateTimeInput).daterangepicker({
				showDropdowns: true,
				timePicker: true,
				timePicker24Hour: true,
				timePickerSeconds: true,
				startDate: moment().startOf('hour'),
				endDate: moment().startOf('hour').add(32, 'hour'),
				opens: 'left',
				locale: {
					format: 'hh:mmA DD/MM/YY'
				}
			},dateTimeChange);

			// Append display to window
			ftms_ui.window_manager.appendToWindow('Replay Module', display);
		},

		plotTracks: function(tracks){
			// Send tracks to track manager
			// ftms_ui.track_manager.receiveTrackUpdate(track);
		},

		isReplayMode: function(){
			return replaySwitch.checked;
		}
	}
}());