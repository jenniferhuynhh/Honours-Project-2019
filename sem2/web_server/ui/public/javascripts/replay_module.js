var ReplayModule = (function() {
	// Private
	var ftms_ui;
	var display;
	var replaySwitch;
	var drp;
	var cViewer;
	var previousTime;

	// Called whenever the replay mode switch is changed
	function switchChange(e){
		ftms_ui.track_manager.removeAll();

		if (replaySwitch.checked){
			ftms_ui.map_module.showReplayControls();
			cViewer.clock.onTick.addEventListener(clockTick);
			cViewer.timeline.addEventListener('click', timelineChanged);
		}else{
			ftms_ui.map_module.hideReplayControls();
			cViewer.clock.onTick.removeEventListener(clockTick);
			cViewer.timeline.removeEventListener('click', timelineChanged);
		}
	};

	// Called whenever the date picker is updated
	function dateTimeChange(start, end, label){
		var startInJulian = Cesium.JulianDate.fromDate(start.toDate());
		var endInJulian = Cesium.JulianDate.fromDate(end.toDate());
		
		// Update Cesium Clock
		cViewer.clock.startTime = startInJulian;
		cViewer.clock.stopTime = endInJulian;

		// Update Cesium Timeline
		cViewer.timeline.zoomTo(startInJulian, endInJulian);
	};

	// Called by the clock every time it ticks in order to get replay tracks
	function clockTick(){
		var playBtn = cViewer.animation.viewModel.playForwardViewModel;
		var rewindBtn = cViewer.animation.viewModel.playReverseViewModel;
		if (playBtn.toggled || rewindBtn.toggled){
			var currMilliseconds = Cesium.JulianDate.toDate(cViewer.clock.currentTime).getTime();
			ftms_ui.event_manager.sendTrackReplayRequest(previousTime, currMilliseconds, this.plotTracks);
			previousTime = currMilliseconds;
		}
	};

	// Called when the user clicks on the Cesium timeline widget
	function timelineChanged(){
		var currMilliseconds = Cesium.JulianDate.toDate(cViewer.clock.currentTime).getTime();

		ftms_ui.track_manager.removeAll();
		
		ftms_ui.event_manager.sendTrackReplayRequest(currMilliseconds-500, currMilliseconds, this.plotTracks);
		previousTime = currMilliseconds;
	};

	function setBounds(start, end){
		drp = jQuery('#replayDateTimeInput').daterangepicker({
			showDropdowns: true,
			timePicker: true,
			timePicker24Hour: true,
			timePickerSeconds: true,
			startDate: moment().startOf('hour'),
			endDate: moment().startOf('hour').add(32, 'hour'),
			opens: 'left',
			locale: {
				format: 'kk:mm:ss DD/MM/YY'
			}
		},dateTimeChange);
	};

	function plotTracks(tracks){
		console.log(tracks);
		// Send tracks to track manager
		// ftms_ui.track_manager.receiveTrackUpdate(track);
	};

	// Public
	return {
		init: function(ftms) {
			// Link FTMS UI system
			ftms_ui = ftms;

			// Create div for replay controls to sit in
			display = document.createElement('div');
			display.classList.add('replay_module');

			// Get Cesium Viewer
			cViewer = ftms_ui.map_module.getViewer();

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
			replaySwitch.addEventListener('change',switchChange);
			switchBox.appendChild(replaySwitch);

			var sliderCircle = document.createElement('span');
			sliderCircle.classList.add('slider', 'round');
			switchBox.appendChild(sliderCircle);

			var rightLabel = document.createElement('h1');
			rightLabel.innerHTML = "On";
			switchDiv.appendChild(rightLabel);

			// Start/End Input
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

			ftms_ui.event_manager.sendReplayBoundRequest(setBounds);

			// Append display to window
			ftms_ui.window_manager.appendToWindow('Replay Module', display);
		},

		isReplayMode: function(){
			return replaySwitch.checked;
		}
	}
}());