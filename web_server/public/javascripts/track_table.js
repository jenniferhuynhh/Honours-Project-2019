function TrackTableModule() {
	this.ftms_ui; //FTMS UI system this module is linked to
	this.track_table; //the table that track data will be displayed in
	this.selected_track_id; //ID of the currently selected track
	this.header_elements; //Labels to be displayed in header

	//Initialises track table module
	this.initialise = function(ftms_ui) {
		//Link FTMS UI system
		this.ftms_ui = ftms_ui;

		//Generate and store track data table element
		this.track_table = document.createElement("table");
		this.track_table.setAttribute("class", "track_table");
		this.selected_track_id = -1;

		//Print headers
		this.header_elements = ["ID", "Affiliation", "Latitude", "Longitude", "Speed", "Course", "Route"];
		var header = document.createElement("tr");
		for(var i = 0; i < this.header_elements.length; i++) {
			var td = document.createElement("td");
			td.appendChild(document.createTextNode(this.header_elements[i]));
			header.appendChild(td);
		}
		this.track_table.appendChild(header);

		//Show table
		this.ftms_ui.window_manager.appendToWindow(this.track_table, 0, 1);

		this.updateTrackTable();
	}

	//Updates given track's row
	this.updateEntry = function(track) {
		//Find track's row
		var row;
		for(var i = 1; i < this.track_table.rows.length; i++) {
			if(this.track_table.rows[i].cells[0].innerHTML == track.id) {
				row = this.track_table.rows[i];
			}
		}

		//Highlight the selected row
		if(track.id == this.selected_track_id) {
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
			track.route
		];

		//Print data
		for(var i = 0; i < elements.length; i++) {
			row.cells[i].innerHTML = elements[i];
		}
	}

	//Creates row for a given track
	this.addEntry = function(track) {
		var row = document.createElement("tr");

		//Handle track selecting
		var self = this;
		row.addEventListener("click", function() {
			if(self.selected_track_id == this.cells[0].innerHTML) {
				self.selected_track_id = -1;
				self.ftms_ui.map_module.viewer.selectedEntity = undefined;
			} else {
				self.selected_track_id = this.cells[0].innerHTML;
				self.ftms_ui.map_module.viewer.selectedEntity = self.ftms_ui.map_module.viewer.entities.getById(this.cells[0].innerHTML)
			}
			self.ftms_ui.map_module.render();
			self.updateTrackTable();
			self.ftms_ui.classification_module.updateDisplay();
		});

		//Create cells
		for(var i = 0; i < this.header_elements.length; i++) {
			var data = document.createElement("td");
			row.appendChild(data);
		}

		//Print track's id in first row and add to table
		row.cells[0].innerHTML = track.id;
		this.track_table.appendChild(row);

		this.updateEntry(track);
	}

	//Updates track data table with current track data
	this.updateTrackTable = function() {
		//Grab track data
		var tracks = this.ftms_ui.simulator.tracks;

		//If table is empty, add all existing tracks
		if(this.track_table.rows.length <= 1) {
			for(var i = 0; i < tracks.length; i++) {
				this.addEntry(tracks[i]);
			}
			return;
		}

		//If no tracks exist, empty table
		if(tracks.length == 0) {
			while(this.track_table.rows.length > 1) {
				this.track_table.removeChild(this.track_table.rows[1]);
			}
			return;
		}

		//Update or add track's data
		for(var i = 0; i < tracks.length; i++) {
			for(var j = 1; j < this.track_table.rows.length; j++) {
				if(this.track_table.rows[j].cells[0].innerHTML == tracks[i].id) { //If track data is already on table
					this.updateEntry(tracks[i]);
					break;
				} else if (j == this.track_table.rows.length-1) { //If not found
					this.addEntry(tracks[i]);
				}
			}
		}

		//Delete missing track's data
		for(var i = 1; i < this.track_table.rows.length; i++) {
			for(var j = 0; j < tracks.length; j++) {
				if(this.track_table.rows[i].cells[0].innerHTML == tracks[j].id) { //If track still exists
					break;
				} else if (j == tracks.length-1) { //If not found
					this.track_table.removeChild(this.track_table.rows[i--]);
				}
			}
		}
	}
}