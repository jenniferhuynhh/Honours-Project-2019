var ReplayModule = (function() {
	// Private
	var ftms_ui;
	var display;

	// Public
	return {
		init: function(ftms) {
			// Link FTMS UI system
			ftms_ui = ftms;

			// Create div for replay controls to sit in
			display = document.createElement('div');
			display.classList.add('replay_module');

			// Create replay controls


			// Append display to window
			ftms_ui.window_manager.appendToWindow('Replay Module', display);
		},

		plotTracks: function(tracks){
			// Send tracks to track manager
			// ftms_ui.
		}
	}
}());