var ReplayModule = (function() {
	// Private
	var ftms_ui;
	var display;
	var replaySwitch;
	var drp;
	var cViewer;
	var previousTime;
	var startTS;
	var endTS;

	// Called whenever the replay mode switch is changed
	function switchChange(e){
		ftms_ui.track_manager.removeAll();
		ftms_ui.alert_module.removeAll();

		if (replaySwitch.checked){
			ftms_ui.map_module.showReplayControls();
			cViewer.clock.onTick.addEventListener(clockTick);
			cViewer.timeline.addEventListener('click', timelineChanged);
			updateTimeline();
		}else{
			ftms_ui.map_module.hideReplayControls();
			cViewer.clock.onTick.removeEventListener(clockTick);
			cViewer.timeline.removeEventListener('click', timelineChanged);
		}
	};

	// Called whenever the date picker is updated
	function dateTimeChange(start, end, label=null){
		startTS = start.valueOf();
		endTS = end.valueOf();
		
		updateTimeline();
	};

	function updateTimeline(){
		var startInJulian = Cesium.JulianDate.fromDate(new Date(startTS));
		var endInJulian = Cesium.JulianDate.fromDate(new Date(endTS));

		// Update Cesium Clock
		cViewer.clock.currentTime = startInJulian;
		cViewer.clock.startTime = startInJulian;
		cViewer.clock.stopTime = endInJulian;

		// Update Cesium Timeline
		cViewer.timeline.zoomTo(startInJulian, endInJulian);
	}

	// Called by the clock every time it ticks in order to get replay tracks
	function clockTick(){
		var playBtn = cViewer.animation.viewModel.playForwardViewModel;
		var rewindBtn = cViewer.animation.viewModel.playReverseViewModel;
		if (playBtn.toggled || rewindBtn.toggled){
			var currMilliseconds = Cesium.JulianDate.toDate(cViewer.clock.currentTime).getTime();
			var t = currMilliseconds;

			// Swap the times in the event of a rewind
			if (previousTime > currMilliseconds){
				currMilliseconds = previousTime;
				previousTime = t;
			}

			ftms_ui.event_manager.sendTrackReplayRequest(previousTime, currMilliseconds, displayReplayData);
			previousTime = t;
		}
	};

	// Called when the user clicks on the Cesium timeline widget
	function timelineChanged(){
		var currMilliseconds = Cesium.JulianDate.toDate(cViewer.clock.currentTime).getTime();

		ftms_ui.track_manager.removeAll();
		
		ftms_ui.event_manager.sendTrackReplayRequest(currMilliseconds-500, currMilliseconds, displayReplayData);
		previousTime = currMilliseconds;
	};

	function setBounds(start, end){
		previousTime = start-100;
		startTS = start;
		endTS = end;

		drp = jQuery('#replayDateTimeInput').daterangepicker({
			showDropdowns: true,
			timePicker: true,
			timePicker24Hour: true,
			timePickerSeconds: true,
			startDate: moment(start),
			endDate: moment(end),
			opens: 'left',
			drops: 'up',
			autoUpdateInput: true,
			customRangeLabel: false,
			alwaysShowCalendars: true,
			linkedCalendars: false,
			ranges: {
				'All Data' : [moment(start), moment(end)]
			},
			locale: {
				format: 'kk:mm:ss DD/MM/YY'
			}
		},dateTimeChange);
	};

	function displayReplayData(data){
		// Send tracks to track manager
		for (var i = 0; i < data.tracks.length; i++)
			ftms_ui.track_manager.recieveTrackUpdate(data.tracks[i]);

		// Send alerts to alert module
		for (var i = 0; i < data.alerts.length; i++)
			ftms_ui.alert_module.addAlert(data.alerts[i]);
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