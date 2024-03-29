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
				if(!ftms_ui.replay_module.isReplayMode())
					ftms_ui.track_manager.recieveTrackUpdate(track);
			});

			socket.on('receive_manual_track_id', function(id) {
				ftms_ui.track_manager.recieveManualTrackID(id);
			});

			//ALERTS
			socket.on('alert', function(message){
				if(!ftms_ui.replay_module.isReplayMode())
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
				ftms_ui.authorisation_approval_module.receiveRequest(data);
			});

			socket.on('receive_confirmation', function(data) {
				ftms_ui.authorisation_approval_module.receiveConfirmation(data);
			});

			socket.on('receive_request_status', function(data) {
				ftms_ui.authorisation_approval_module.receiveRequestStatus(data);
			});

			socket.on('receive_all_requests', function(data) {
				ftms_ui.authorisation_approval_module.receiveRequests(data);
			});

			socket.on('receive_all_confirmations', function(data) {
				ftms_ui.authorisation_approval_module.receiveConfirmations(data);
			});

			socket.on('response_deleted', function(requestId) {
				ftms_ui.authorisation_approval_module.deleteResponse(requestId);
			});

			//SETTINGS
			socket.on('receive_layouts', function(data) {
				ftms_ui.settings.receiveLayouts(data);
			});
		},
		
		//SEND MESSAGES TO SERVER
		//TRACK MANAGER
		sendTrackUpdate: function(track, update_data) {
			update_data.trackId = track.trackId;
			socket.emit('send_track_update', track, update_data);
		},

		getManualTrackId: function(callback) {
			socket.emit('get_manual_track_id', callback);
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
		},

		getAllRequests: function() {
			socket.emit('get_all_requests');
		},

		deleteResponse: function(requestId) {
			socket.emit('delete_response', requestId);
		},

		//TRACK REPLAY
		sendTrackReplayRequest: function(prevTime, newTime, displayReplayData){
			socket.emit('get_replay_data', prevTime, newTime, displayReplayData);
		},

		sendReplayBoundRequest: function(setBounds){
			socket.emit('get_replay_bounds', setBounds);
		},

		//SETTINGS
		saveLayout: function(layout) {
			socket.emit('save_layout', layout);
		},

		loadLayouts: function() {
			socket.emit('load_layouts');
		},

		//SETTINGS
		saveSettings: function(settings) {
			socket.emit('save_settings', settings);
		}, 

		loadSettings: function(callback) {
			socket.emit('load_settings', callback);
		}
	}
}());
