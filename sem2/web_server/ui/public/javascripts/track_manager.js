var TrackManager = (function() {
	//Private
	var ftms_ui; //FTMS UI system this module is linked to
	var tracks; //Map of tracks, mapped to their unique ID
	var listeners = [];
	var socket;

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
						track.latitude = parsed_track.latitude;
						track.longitude = parsed_track.longitude;
						track.altitude = parsed_track.altitude;
						track.speed = parsed_track.speed;
						track.course = parsed_track.course;
						if(parsed_track.state != "UNKNOWN") {
							track.affiliation = parsed_track.state.toLowerCase();
						}
					} else { //If existing track not found, create new track
						track = new Track(parsed_track.trackId, parsed_track.latitude, parsed_track.longitude, parsed_track.altitude, parsed_track.speed, parsed_track.course, parsed_track.state.toLowerCase(), "sea");
						self.setTrack(track);
					}

					//Tells the map to draw the new track
					ftms_ui.map_module.paintTrack(track);

					//Display data of new track positions
					ftms_ui.track_table_module.updateTrackTable();
				}
			});
		},

		//Sets track (CREATE/UPDATE)
		setTrack: function(track) {
			tracks.set(Number(track.id), track);
		},

		updateTrack: function(track, properties) {
			for(var prop in track) {
				if(Object.prototype.hasOwnProperty.call(track, prop)) {
				// do stuff
				}
			}
		},

		//Returns track with matching ID (READ)
		getTrack: function(id) {
			return tracks.get(Number(id));
		},

		//Removes a track from the track array by ID (DELETE)
		deleteTrack: function(id) {
			tracks.delete(Number(id));
		},

		//Gets all tracks
		getTracks: function() {
			return tracks;
		},

		//Registers a listener (CREATE)
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
			var t1 = new Track(123, 26.576489, 56.423728, 0, 20, 270, "friendly", "sea");
			this.setTrack(t1);
			ftms_ui.map_module.paintTrack(t1);

			//Display data of new track positions
			ftms_ui.track_table_module.updateTrackTable();
		}
	}
}());