function TrackTableModule() {
	this.ftms_ui; //FTMS UI system this module is linked to
	this.track_table; //the table that track data will be displayed in
	this.current_track_ids = []; //list of track IDs being displayed

	//Initialises track table module
	this.initialise = function(ftms_ui) {
		//Link FTMS UI system
		this.ftms_ui = ftms_ui;

		//Generate and store track data table element
		this.track_table = document.createElement("table");
		this.track_table.setAttribute("class", "track_table");
		var header_elements = ["ID", "Affiliation", "Latitude", "Longitude", "Speed", "Course", "Type", "Route"];

		//Print headers
		var header = document.createElement("tr");
		for(var i = 0; i < header_elements.length; i++) {
			var td = document.createElement("td");
			td.appendChild(document.createTextNode(header_elements[i]));
			header.appendChild(td);
		}
		this.track_table.appendChild(header);

		//Show table
		this.ftms_ui.window_manager.appendToWindow(this.track_table, 0, 1);

		this.updateTrackTable();
	}

	this.updateEntry = function(track) {
		log("update");
		var row;
		for(var i = 1; i < this.current_track_ids.length+1; i++) {
			if(this.track_table.rows[i].cells[0].innerHTML == track.id) {
				row = this.track_table.rows[i];
			}
		}

		//Check if row should appear highlighted
		if(track.highlighted) {
			row.setAttribute("class", "highlighted_" + track.affiliation + "_data");
		} else {
			row.setAttribute("class", track.affiliation + "_data");
		}

		var elements = [ //Track's elements to be displayed
			track.id,
			track.affiliation,
			track.latitude.toFixed(8),
			track.longitude.toFixed(8),
			track.speed.toFixed(7),
			track.course + "°",
			track.type,
			track.route
		];

		for(var i = 0; i < row.cells.length; i++) {
			row.cells[i].innerHTML = elements[i];
		}
	}

	this.addEntry = function(track) {
		log("add");
		var row = document.createElement("tr");
			
		var elements = [ //Track's elements to be displayed
			track.id,
			track.affiliation,
			track.latitude.toFixed(8),
			track.longitude.toFixed(8),
			track.speed.toFixed(7),
			track.course + "°",
			track.type,
			track.route
		];

		//Handle track highlighting
		var self = this; //Store current function scope
		row.addEventListener("click", function() {
			var track = self.ftms_ui.simulator.getTrack([this.cells[0].innerHTML]);
			track.highlighted = !track.highlighted;
			self.updateTrackTable();
		});

		//Check if row should appear highlighted
		if(track.highlighted) {
			row.setAttribute("class", "highlighted_" + track.affiliation + "_data");
		} else {
			row.setAttribute("class", track.affiliation + "_data");
		}

		//Print data
		for(var i = 0; i < elements.length; i++) {
			var data = document.createElement("td");
			data.appendChild(document.createTextNode(elements[i]));
			row.appendChild(data);
		}

		this.current_track_ids.push(track.id);
		this.track_table.appendChild(row);
	}

	//Updates track data table with current track data
	this.updateTrackTable = function() {
		//Grab new track data
		var tracks = this.ftms_ui.simulator.tracks;

		//Update or add tracks' data
		for(var i = 0; i < tracks.length; i++) {
			for(var j = 0; j < this.current_track_ids.length; j++) {
				if(this.current_track_ids[j] == tracks[i].id) {
					this.updateEntry(tracks[i]);
					break;
				} else if (j == this.current_track_ids.length) {
					this.addEntry(tracks[i]);
				}
			}
		}

		//If table is empty, add all existing tracks
		if(this.current_track_ids.length == 0) {
			for(var i = 0; i < tracks.length; i++) {
				this.addEntry(tracks[i]);
			}
		}
	}
}