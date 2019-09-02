var TrackManager = (function() {
	//Private
	var ftms_ui; //FTMS UI system this module is linked to
	var socket = io();

	//Public
	return {
		tracks: new Map(), //Map of tracks, mapped to their unique ID

		init: function(ftms) {
			//Link FTMS UI system
			ftms_ui = ftms;

			var self = this;
			//Receive new tracks
			socket.on('track', function(json_track) {
				if(json_track[0] == "{") {
					var parsed_track = JSON.parse(json_track);

					var existing_track = self.tracks.get(parsed_track.track_id);
					if(existing_track) {
						existing_track.latitude = parsed_track.latitude;
						existing_track.longitude = parsed_track.longitude;
						existing_track.altitude = parsed_track.altitude;
						existing_track.speed = parsed_track.speed;
						existing_track.course = parsed_track.course;
						if(parsed_track.state != "UNKNOWN") {
							existing_track.affiliation = parsed_track.state.toLowerCase();
						}
					}

					var new_track = new Track(parsed_track.track_id, parsed_track.latitude, parsed_track.longitude, parsed_track.altitude, parsed_track.speed, parsed_track.course, parsed_track.state.toLowerCase(), "sea");
					self.tracks.set(new_track.id, new_track);

					//Tells the map to draw the new track
					ftms_ui.map_module.paintTrack(new_track);

					//Display data of new track positions
					ftms_ui.track_table_module.updateTrackTable();
				}
			});
		},

		//Adds a track for testing purposes
		test: function() {
			var t1 = new Track(123, 26.576489, 56.423728, 0, 20, 270, "friendly", "sea");
			this.tracks.set(t1.id, t1);
			ftms_ui.map_module.paintTrack(t1);

			//Display data of new track positions
			ftms_ui.track_table_module.updateTrackTable();
		},

		//Returns track with matching ID
		getTrack: function(id) {
			return this.tracks.get(Number(id));
		},

		//Removes a track from the track array by ID
		removeTrack: function(id) {
			this.tracks.delete(Number(id));
		}
	}
}());