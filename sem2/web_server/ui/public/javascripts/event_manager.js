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

			var self = this;
			socket.on('recieve_track_update', function(track) {
				self.recieveTrackUpdate(track);
			});
		},

		recieveTrackUpdate: function(json_track) {
			var parsed_track = JSON.parse(json_track);
			ftms_ui.track_manager.recieveTrackUpdate(parsed_track);
		},

		sendTrackUpdate: function(track) {
			socket.emit('send_track_update', track);
		},

		recieveAuthorisationRequest: function(data) {
			ftms_ui.authorisation_approval_module.receiveRequests(data);
		},

		sendAuthorisationRequest: function(data) {
			socket.emit('send_request', data);
		}
	}
}());
//EventManager.sendTrackUpdate(FTMS_UI.track_manager.getTrack(123));