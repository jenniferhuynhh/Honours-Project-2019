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
				this.updateTrack(track, update_data);
			} else { //If existing track not found, create new track
				this.createTrack(incoming_track_data);
			}
		},

		//CRUD operations
		//Creates track, adds listeners, then calls this module's create event listeners (CREATE)
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
				if(selected_track == track) selected_track = null;
			});

			tracks.set(track.trackId, track);
			this.callListeners("create", track);
		},

		//Returns track with matching ID (READ)
		getTrack: function(trackId) {
			return tracks.get(Number(trackId));
		},

		//Updates track locally (UPDATE)
		updateTrack: function(track, track_data) {
			track.updateData(track_data);
		},

		//Removes a track from the track array by ID (DELETE)
		deleteTrack: function(trackId) {
			track.delete();
			tracks.delete(track.trackId);
		},

		//Returns iterable map of all tracks (READ ALL)
		getTracks: function() {
			return tracks;
		},

		//Sets selected track
		setSelectedTrack: function(track) {
			selected_track = track;
			this.callListeners("selected", selected_track);
		},

		//Returns selected track
		getSelectedTrack: function() {
			return selected_track;
		},

		addEventListener: function(event, func) {
			listeners[event].push(func);
		},

		callListeners: function(event, track) {
			for(var i = 0; i < listeners[event].length; i++) {
				listeners[event][i](track);
			}
		},

		//Adds a track for testing purposes
		test: function() {
			return;
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
			//this.updateTrack(this.getTrack(t1.trackId), {affiliation: "hostile"});
		}
	}
}());

//Track object definition
class Track {
	constructor(track_data) {
		this.trackId = Number(track_data.trackId); //unique ID
		this.latitude = track_data.latitude; //-34.912955 (Adelaide)
		this.longitude = track_data.longitude; //138.365660 (Adelaide)
		this.altitude = track_data.altitude;
		this.speed = track_data.speed;
		this.course = track_data.course; //course in degrees
		if(track_data.affiliation) { //affiliation of track (friendly, hostile, etc.)
			this.affiliation = track_data.affiliation.toLowerCase()
		} else {
			this.affiliation = "unknown";
		}
		if(track_data.domain) { //domain of track (air, sea, land, subsurface)
			this.domain = track_data.domain.toLowerCase()
		} else {
			this.domain = "sea";
		}
		if(track_data.type) { //type of track
			this.type = track_data.type.toLowerCase()
		} else {
			this.type = "naval ship";
		}

		this.listeners = { //Events that listeners can listen for
			update: [],
			selected: [],
			delete: []
		};
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

	addEventListener(event, func) {
		this.listeners[event].push(func);
	}

	callListeners(event) {
		for(var i = 0; i < this.listeners[event].length; i++) {
			this.listeners[event][i]();
		}
	}

	removeEventListener(event, func) {
		for (var i = 0; i < this.listeners[event].length; i++) {
			if(this.listeners[event][i] == func) {
				this.listeners[event].splice(i, 1);
				break;
			}
		}
	}
}