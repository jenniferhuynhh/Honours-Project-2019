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
			socket = io('http://localhost:3000');

			//RECEIVE MESSAGES FROM SERVER
			//TRACK MANAGER
			socket.on('recieve_track_update', function(track) {
				if (!ftms_ui.replay_module.isReplayMode())
					ftms_ui.track_manager.recieveTrackUpdate(track);
			});

			socket.on('receive_manual_track_id', function(id) {
				ftms_ui.track_manager.recieveManualTrackID(id);
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

			//SETTINGS
			socket.on('receive_layouts', function(data) {
				ftms_ui.settings.receiveLayouts(data);
			});
		},
		
		//SEND MESSAGES TO SERVER
		//TRACK MANAGER
		sendTrackUpdate: function(track, updatedData) {
			track.trackId = track.id;
			socket.emit('send_track_update', track, updatedData);
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

		//TRACK REPLAY
		sendTrackReplayRequest: function(prevTime, newTime, plotTracks){
			console.log(typeof plotTracks);
			// (tracks) =>{
			// 	plotTracks(tracks);
			// }
			socket.emit('get_replay_tracks', prevTime, newTime, plotTracks);
		},

		sendReplayBoundRequest: function(setBounds){
			socket.emit('get_replay_bounds', setBounds);
		},

		saveLayout: function(layout) {
			socket.emit('save_layout', layout);
		},

		loadLayouts: function() {
			socket.emit('load_layouts');
		}
	}
}());