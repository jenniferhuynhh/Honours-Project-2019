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

			socket.on('receive_request', function(data) {
				self.receiveAuthorisationRequest(data);
			});

			socket.on('receive_confirmation', function(data) {
				self.receiveConfirmation(data);
			});

			socket.on('receive_request_status', function(data) {
				self.receiveRequestStatus(data);
			});
		},

		recieveTrackUpdate: function(json_track) {
			var parsed_track = JSON.parse(json_track);
			ftms_ui.track_manager.recieveTrackUpdate(parsed_track);
		},

		sendTrackUpdate: function(track) {
			socket.emit('send_track_update', track);
		},

		receiveAuthorisationRequest: function(data) {
			ftms_ui.authorisation_approval_module.receiveRequests(data);
		},

		sendAuthorisationRequest: function(data) {
			socket.emit('send_request', data);
		},

		receiveConfirmation: function(data) {
			ftms_ui.authorisation_approval_module.receiveConfirmation(data);
		},

		sendRequestStatus: function(data) {
			socket.emit('send_request_status', data);
		},

		receiveRequestStatus: function(data) {
			ftms_ui.authorisation_approval_module.receiveRequestStatus(data);
		}
	}
}());
//EventManager.sendTrackUpdate(FTMS_UI.track_manager.getTrack(123));