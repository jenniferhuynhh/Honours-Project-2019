var TrackManager = (function() {
	//Private
	var ftms_ui; //FTMS UI system this module is linked to
	var tracks; //Map of tracks, mapped to their unique ID
	var listeners = [];
	var selected_track;

	//Public
	return {
		init: function(ftms) {
			//Link FTMS UI system
			ftms_ui = ftms;

			tracks = new Map();
		},

		//Handles recieving a new track from the EventManager
		recieveTrackUpdate: function(incoming_track) {
			var track = this.getTrack(incoming_track.trackId);
			if(track) { //If track exists, update properties
				var updateData = {
					latitude: incoming_track.latitude,
					longitude: incoming_track.longitude,
					altitude: incoming_track.altitude,
					speed: incoming_track.speed,
					course: incoming_track.course
				};
				if(incoming_track.type != undefined) {
					updateData.type = incoming_track.type;
				}
				if(incoming_track.affiliation != undefined) {
					updateData.affiliation = incoming_track.affiliation;
				}
				if(incoming_track.domain != undefined) {
					updateData.domain = incoming_track.domain;
				}
				this.updateTrack(track, updateData);
			} else { //If existing track not found, create new track
				track = new Track(incoming_track.trackId, incoming_track.latitude, incoming_track.longitude, incoming_track.altitude, incoming_track.speed, incoming_track.course, "unknown", "sea");
				this.setTrack(track);
			}
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

			//console.log(track);
			
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

		//Sets selected track
		setSelectedTrack: function(track) {
			selected_track = track;
			this.callListeners();
		},

		//Returns selected track
		getSelectedTrack: function() {
			return selected_track;
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

			//track testing
			//var alert = JSON.parse('{"_id":{"$oid":"5d952b363f446c644762f433"},"timestamp":{"$numberLong":"1570057014412"},"id":{"$numberInt":"1"},"severity":"LOW","status":"NEW","text":"System Track created","associatedObjectId":"4194311"}');
			//ftms_ui.alert_module.addAlert(alert);

			//Display data of new track positions
			ftms_ui.track_table_module.update();
		}
	}
}());