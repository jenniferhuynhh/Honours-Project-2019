var EventManager = (function() {
	//Private
	var ftms_ui; //FTMS UI system this module is linked to
	var socket;

	//Public
	return {
		init: function(ftms) {
			//Link FTMS UI system
			ftms_ui = ftms;

			//Socket.io library being used for server communications
			socket = io();

			//RECEIVE MESSAGES FROM SERVER
			//TRACK MANAGER
			socket.on('recieve_track_update', function(track) {
				ftms_ui.track_manager.recieveTrackUpdate(track);
			});

			//ALERTS
			socket.on('alert', function(message){
				ftms_ui.alert_module.addAlert(message);
			});

			//MESSAGING
			socket.on('is_online', function(username) {
				ftms_ui.messaging_module.onConnect(username);
			});

			socket.on('is_offline', function(username) {
				ftms_ui.messaging_module.onDisconnect(username);
			});

			socket.on('chat_message', function(username, message) {
				ftms_ui.messaging_module.onMessage(username, message);
			});

			//AUTHORISATION APPROVAL
			socket.on('receive_request', function(data) {
				ftms_ui.authorisation_approval_module.receiveRequests(data);
			});

			socket.on('receive_confirmation', function(data) {
				ftms_ui.authorisation_approval_module.receiveConfirmation(data);
			});

			socket.on('receive_request_status', function(data) {
				ftms_ui.authorisation_approval_module.receiveRequestStatus(data);
			});
		},
		
		//SEND MESSAGES TO SERVER
		//TRACK MANAGER
		sendTrackUpdate: function(track, updatedData) {
			track.trackId = track.id;
			socket.emit('send_track_update', track, updatedData);
		},

		//MESSAGING
		userConnect: function(username, role) {
			socket.emit('username', username, role);
		},

		sendMessage: function(message) {
			socket.emit('chat_message', message);
		},

		//AUTHORISATION APPROVAL
		sendAuthorisationRequest: function(data) {
			socket.emit('send_request', data);
		},

		sendRequestStatus: function(data) {
			socket.emit('send_request_status', data);
		}
	}
}());