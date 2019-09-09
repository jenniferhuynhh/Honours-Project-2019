var TrackManager = (function() {
	//Private
	var ftms_ui; //FTMS UI system this module is linked to
	var tracks; //Map of tracks, mapped to their unique ID
	var listeners = [];
	var socket;
	var selected_track;

	//Public
	return {
		init: function(ftms) {
			//Link FTMS UI system
			ftms_ui = ftms;

			tracks = new Map();
			socket = ftms_ui.socket;

			var self = this;
			//Receive new tracks
			socket.on('track', function(json_track) {
				if(json_track[0] == "{") {
					var parsed_track = JSON.parse(json_track);

					var track = self.getTrack(parsed_track.trackId);
					if(track) { //If track exists, update properties
						var updatedData = {
							latitude: parsed_track.latitude,
							longitude: parsed_track.longitude,
							altitude: parsed_track.altitude,
							speed: parsed_track.speed,
							course: parsed_track.course
						};
						if(parsed_track.state != "UNKNOWN") {
							updatedData.affiliation = parsed_track.state.toLowerCase();
						}
						self.updateTrack(track, updatedData);
					} else { //If existing track not found, create new track
						track = new Track(parsed_track.trackId, parsed_track.latitude, parsed_track.longitude, parsed_track.altitude, parsed_track.speed, parsed_track.course, parsed_track.state.toLowerCase(), "sea");
						self.setTrack(track);
					}
				}
			});
		},

		//Sets track (CREATE)
		setTrack: function(track) {
			if(this.getTrack(track.id)) { //If track with given ID already exists, stop
				log("Error: Track with ID '" + track.id + "' already exists!");
				return;
			}
			tracks.set(track.id, track);
			this.callListeners();
		},

		//Returns track with matching ID (READ)
		getTrack: function(id) {
			return tracks.get(Number(id));
		},

		//Updates track (UPDATE)
		updateTrack: function(track, properties) {
			//Update track locally
			for(var prop in properties) {
				if(Object.prototype.hasOwnProperty.call(track, prop)) {
					track[prop] = properties[prop];
				}
			}
			//Send track update to track server
			ftms_ui.event_manager.sendTrackUpdate(track);
			
			this.callListeners();
		},

		//Removes a track from the track array by ID (DELETE)
		deleteTrack: function(id) {
			tracks.delete(Number(id));
		},

		//Gets all tracks
		getTracks: function() {
			return tracks;
		},

		//Returns selected track
		getSelectedTrack: function() {
			return selected_track;
		},

		//Sets selected track
		setSelectedTrack: function(track) {
			selected_track = track;
			this.callListeners();
		},

		//Registers a listener
		setListener: function(listener) {
			listeners.push(listener);
		},

		//Calls update() function of all listeners
		callListeners: function() {
			for(var i = 0; i < listeners.length; i++) {
				listeners[i].update();
			}
		},

		//Adds a track for testing purposes
		test: function() {
			var test_listener = {
				update: function() {log("listener called")}
			};
			//this.setListener(test_listener);

			var t1 = new Track(123, 26.576489, 56.423728, 0, 20, 270, "friendly", "sea");
			this.setTrack(t1);
			//var t2 = new Track(123, 26.576489, 56.423728, 0, 20, 270, "neutral", "land");
			//this.setTrack(t2);
			this.updateTrack(t1, {affiliation: "hostile"});
			ftms_ui.map_module.paintTrack(t1);

			//Display data of new track positions
			ftms_ui.track_table_module.update();
		}
	}
}());