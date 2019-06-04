function TrackTableModule() {
	this.ftms_ui; //FTMS UI system this module is linked to
	this.display;
	this.track_table; //the table that track data will be displayed in
	this.selected_track_id; //ID of the currently selected track
	this.header_elements; //Labels to be displayed in header

	//Initialises track table module
	this.initialise = function(ftms_ui) {
		//Link FTMS UI system
		this.ftms_ui = ftms_ui;
		this.display = document.createElement('div');
		this.display.setAttribute('class', 'track_table_display');

		//Generate and store track data table element
		this.track_table = document.createElement("table");
		this.track_table.setAttribute("class", "track_table");
		this.selected_track_id = -1;

		//Print headers
		this.header_elements = ["ID", "Affiliation", "Latitude", "Longitude", "Speed", "Course"];
		var header = document.createElement("tr");
		for(var i = 0; i < this.header_elements.length; i++) {
			var th = document.createElement("th");
			th.appendChild(document.createTextNode(this.header_elements[i]));
			header.appendChild(th);
		}
		this.track_table.appendChild(header);
		this.display.appendChild(this.track_table);

		//Show table
		this.ftms_ui.window_manager.appendToWindow('Track Table Module', this.display);

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
			((track.speed/0.85)*1000000*60*60)/1000 + "km/h",
			track.course + "°"
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
		var self = this;

		//If table is empty, add all existing tracks
		if(this.track_table.rows.length <= 1) {
			tracks.forEach(function(value, key, map){
				self.addEntry(value);
			});
			return;
		}

		//If no tracks exist, empty table
		if(tracks.size == 0) {
			while(this.track_table.rows.length > 1) {
				this.track_table.removeChild(this.track_table.rows[1]);
			}
			return;
		}

		//Update or add track's data
		tracks.forEach(function(value, key, map){
			for(var j = 1; j < self.track_table.rows.length; j++) {
				if(self.track_table.rows[j].cells[0].innerHTML == value.id) { //If track data is already on table
					self.updateEntry(value);
					break;
				} else if (j == self.track_table.rows.length-1) { //If not found
					self.addEntry(value);
				}
			}
		});

		//Delete missing track's data
		for(var i = 1; i < this.track_table.rows.length; i++) {
			if(!tracks.has(this.track_table.rows[i].cells[0].innerHTML)) {
				this.track_table.removeChild(this.track_table.rows[i--]);
			}
		}
	}
}