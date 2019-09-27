var TrackManager = (function() {
	//Private
	var ftms_ui; //FTMS UI system this module is linked to
	var listeners = { //Events that listeners can listen for
			create: [],
			selected: []
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
				this.createTrack(incoming_track_data);
			}
		},

		//CRUD operations
		//Creates track, adds listeners, then calls this module's create event listeners (CREATE)
		createTrack: function(data) {
			if(this.getTrack(data.id)) { //If track with given ID already exists, stop
				log("Error: Track with ID '" + data.id + "' already exists!");
				return;
			}

			var track = new Track(data);

			//Handle track being selected
			track.addEventListener("selected", () => {
				if(selected_track == track) selected_track = null;
				else selected_track = track;
				this.callListeners("selected", selected_track);
			});

			//Handle track being deleted
			track.addEventListener("delete", () => {
				if(selected_track == track) selected_track = null;
			});

			tracks.set(track.id, track);
			this.callListeners("create", track);
		},

		//Returns track with matching ID (READ)
		getTrack: function(id) {
			return tracks.get(Number(id));
		},

		//Updates track locally (UPDATE)
		updateTrack: function(track, data) {
			track.updateData(data);
		},

		//Removes a track from the track array by ID (DELETE)
		deleteTrack: function(id) {
			track.delete();
			tracks.delete(track.id);
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
			var t1 = {
				id: 123,
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
			this.updateTrack(this.getTrack(t1.id), {affiliation: "hostile"});
		}
	}
}());

//Track object definition
class Track {
	constructor(data) {
		this.id = Number(data.id); //unique ID
		this.latitude = data.latitude; //-34.912955 (Adelaide)
		this.longitude = data.longitude; //138.365660 (Adelaide)
		this.altitude = data.altitude;
		this.speed = data.speed;
		this.course = data.course; //course in degrees
		this.affiliation = data.affiliation; //affiliation of track (friendly, hostile, etc.)
		this.domain = data.domain; //domain of track (air, sea, land, subsurface)
		this.type = data.type; //type of track

		this.listeners = { //Events that listeners can listen for
			update: [],
			selected: [],
			delete: []
		};
	}

	updateData(data) {
		for(var match in data) {
			if(Object.prototype.hasOwnProperty.call(this, match)) {
				this[match] = data[match];
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
}