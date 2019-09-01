var TrackManager = (function() {
	//Private
	var ftms_ui; //FTMS UI system this module is linked to
	var socket = io();

	//Public
	return {
		tracks: new Map(), //Map of tracks, mapped to their unique ID

		init: function() {
			//Link FTMS UI system
			ftms_ui = ftms;

			//Receive new tracks
			socket.on('track', function(json_track){
				if(jsonTrack[0] == "{") {
					var parsed_track = JSON.parse(json_track);

					var existing_track = this.tracks.get(id);
					if(existing_track) {
						existing_track.latitude = parsed_track.latitude;
						existing_track.longitude = parsed_track.longitude;
						existing_track.altitude = parsed_track.altitude;
						existing_track.speed = parsed_track.speed;
						existing_track.course = parsed_track.course;
						if(aff != "UNKNOWN") {
							existing_track.affiliation = parsed_track.state.toLowerCase();
						}
					}

					var new_track = new Track(parsed_track.trackId, parsed_track.latitude, parsed_track.longitude, parsed_track.altitude, parsed_track.speed, parsed_track.course, existing_track.affiliation.toLowerCase(), "sea");
					this.tracks.set(parsed_track.trackId, new_track);

					//Tells the map to draw the new track
					ftms_ui.map_module.paintTrack(t);

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