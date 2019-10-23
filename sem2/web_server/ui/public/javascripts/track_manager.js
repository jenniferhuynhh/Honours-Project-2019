//NOTE: This manager is for Create/Read operations. Update/Delete operations should be called on the track object itself.
var TrackManager = (function() {
	//Private
	var ftms_ui; //FTMS UI system this module is linked to
	var listeners = { //Events that listeners can listen for
		create: [],
		selected: [],
		unselected: []
	};

	var tracks = new Map(); //Map of tracks, mapped to their unique ID
	var selected_track;

	//Public
	return {
		manual_track_counter: 0,
		init: function(ftms) {
			//Link FTMS UI system
			ftms_ui = ftms;
		},

		//Handles recieving a new track from the EventManager
		recieveTrackUpdate: function(incoming_track_data) {
			var track = this.getTrack(incoming_track_data.trackId);
			if(track) { //If track exists, update properties
				var update_data = {
					latitude: incoming_track_data.latitude,
					longitude: incoming_track_data.longitude,
					altitude: incoming_track_data.altitude,
					speed: incoming_track_data.speed,
					course: incoming_track_data.course
				};

				if(incoming_track_data.type) {
					update_data.type = incoming_track_data.type.toLowerCase();
				}
				if(incoming_track_data.affiliation) {
					update_data.affiliation = incoming_track_data.affiliation.toLowerCase();
				}
				if(incoming_track_data.domain) {
					update_data.domain = incoming_track_data.domain.toLowerCase();
				}
				track.updateData(update_data);
			} else { //If existing track not found, create new track
				if(incoming_track_data.manual) track.manual = incoming_track_data.manual;
				this.createTrack(incoming_track_data);
			}
		},

		//Creates track, adds listeners, then calls this module's create event listeners
		createTrack: function(track_data) {
			if(this.getTrack(track_data.trackId)) { //If track with given ID already exists, stop
				log("Error: Track with ID '" + track_data.trackId + "' already exists!");
				return;
			}

			var track = new Track(track_data);

			//Handle track being selected
			track.addEventListener("selected", () => {
				if(selected_track == track) {
					selected_track = null;
					this.callListeners("unselected");
				} else {
					selected_track = track;
					this.callListeners("selected", selected_track);
				}
			});

			//Handle track being deleted
			track.addEventListener("delete", () => {
				if(selected_track == track) {
					selected_track = null;
					this.callListeners("unselected");
				}
				tracks.delete(track.trackId);
			});

			tracks.set(track.trackId, track);
			this.callListeners("create", track);
		},

		//Returns track with matching ID
		getTrack: function(trackId) {
			return tracks.get(Number(trackId));
		},

		//Returns iterable map of all tracks
		getTracks: function() {
			return tracks;
		},

		//Returns selected track
		getSelectedTrack: function(trackId) {
			return selected_track;
		},

		//Gets the next manual track ID from the server and calls the callback when ready
		getManualTrackId: function(callback) {
			ftms_ui.event_manager.getManualTrackId(callback);
		},

		//Sets selected track
		setSelectedTrack: function(track) {
			selected_track = track;
			this.callListeners("selected", selected_track);
		},

		addEventListener: function(event, func) {
			listeners[event].push(func);
		},

		callListeners: function(event, track) {
			for(var i = 0; i < listeners[event].length; i++) {
				listeners[event][i](track);
			}
		},

		removeAll: function() {
			tracks.forEach(function(track){
				track.delete()
			});
		},

		//Adds a track for testing purposes
		test: function() {
			//return;
			var t1 = {
				trackId: 123,
				latitude: 26.576489,
				longitude: 56.423728,
				altitude: 0,
				speed: 20,
				course: 270,
				affiliation: "friendly",
				domain: "sea",
				type: "naval ship"
			};
			this.createTrack(t1);

			var t2 = {
				trackId: 124,
				latitude: 27.576489,
				longitude: 57.423728,
				altitude: 0,
				speed: 20,
				course: 270,
				affiliation: "hostile",
				domain: "sea",
				type: "naval ship"
			};
			this.createTrack(t2);

			//setTimeout(function() {ftms_ui.map_module.setIconSize(40)}, 2000);
			//this.getTrack(t1.trackId).updateData({affiliation: "hostile"});
		}
	}
}());

//Track object definition
class Track extends EventListener {
	constructor(track_data) {
		super(["update", "selected", "delete"]); //events this object can fire

		this.trackId = Number(track_data.trackId); //unique ID
		this.latitude = track_data.latitude; //-34.912955 (Adelaide)
		this.longitude = track_data.longitude; //138.365660 (Adelaide)
		this.altitude = track_data.altitude;
		this.speed = track_data.speed;
		this.course = track_data.course; //course in degrees
		this.manual = track_data.manual;
 		
 		//affiliation of track (friendly, hostile, etc.)
		if(track_data.affiliation) this.affiliation = track_data.affiliation.toLowerCase()
		else this.affiliation = "unknown";

		//domain of track (air, sea, land, subsurface)
		if(track_data.domain) this.domain = track_data.domain.toLowerCase()
		else this.domain = "sea";

		//type of track
		if(track_data.type) this.type = track_data.type.toLowerCase()
		else this.type = "naval ship";
	}

	updateData(track_data) {
		for(var match in track_data) {
			if(Object.prototype.hasOwnProperty.call(this, match)) {
				this[match] = track_data[match];
			}
		}
		this.callListeners("update");
	}

	delete() {
		this.callListeners("delete");
	}

	selected() {
		this.callListeners("selected");
	}
}