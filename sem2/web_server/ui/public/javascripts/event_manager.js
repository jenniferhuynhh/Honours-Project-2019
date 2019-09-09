var EventManager = (function() {
	//Private
	var ftms_ui; //FTMS UI system this module is linked to
	var socket;

	//Public
	return {
		init: function(ftms) {
			//Link FTMS UI system
			ftms_ui = ftms;

			socket = ftms_ui.socket;
		},

		sendTrackUpdate: function(track) {
			socket.emit('track_update', track);
		}

		//EventManager.sendTrackUpdate(FTMS_UI.track_manager.getTrack(123));
	}
}());