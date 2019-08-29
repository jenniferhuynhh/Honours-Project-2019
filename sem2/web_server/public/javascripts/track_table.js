var TrackTableModule = (function() {
	//Private
	var ftms_ui; //FTMS UI system this module is linked to
	var display;
	var track_table; //the table that track data will be displayed in
	var header_elements; //Labels to be displayed in header

	//Public
	return {
		selected_track_id: -1, //ID of the currently selected track
		initialise: function(ftms) {
			//Link FTMS UI system
			ftms_ui = ftms;
			display = document.createElement('div');
			display.setAttribute('class', 'track_table_display');

			//Generate and store track data table element
			track_table = document.createElement("table");
			track_table.setAttribute("class", "track_table");

			//Print headers
			header_elements = ["ID", "Affiliation", "Latitude", "Longitude", "Speed", "Course"];
			var header = document.createElement("tr");
			for(var i = 0; i < header_elements.length; i++) {
				var th = document.createElement("th");
				th.appendChild(document.createTextNode(header_elements[i]));
				header.appendChild(th);
			}
			track_table.appendChild(header);
			display.appendChild(track_table);

			//Show table
			ftms_ui.window_manager.appendToWindow('Track Table Module', display);

			this.updateTrackTable();
		},
		//Updates given track's row
		updateEntry: function(track) {
			//Find track's row
			var row;
			for(var i = 1; i < track_table.rows.length; i++) {
				if(track_table.rows[i].cells[0].innerHTML == track.id) {
					row = track_table.rows[i];
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
				track.speed.toFixed(3) + " knots",
				track.course.toFixed(3) + "°"
			];

			//Print data
			for(var i = 0; i < elements.length; i++) {
				row.cells[i].innerHTML = elements[i];
			}
		},
		//Creates row for a given track
		addEntry: function(track) {
			var row = document.createElement("tr");

			//Handle track selecting
			var self = this;
			row.addEventListener("click", function() {
				if(self.selected_track_id == this.cells[0].innerHTML) {
					self.selected_track_id = -1;
					ftms_ui.map_module.getViewer().selectedEntity = undefined;
				} else {
					self.selected_track_id = this.cells[0].innerHTML;
					ftms_ui.map_module.getViewer().selectedEntity = ftms_ui.map_module.getViewer().entities.getById(this.cells[0].innerHTML)
				}
				ftms_ui.map_module.render();
				self.updateTrackTable();
				ftms_ui.classification_module.updateDisplay();
			});

			//Create cells
			for(var i = 0; i < header_elements.length; i++) {
				var data = document.createElement("td");
				row.appendChild(data);
			}

			//Print track's id in first row and add to table
			row.cells[0].innerHTML = track.id;
			track_table.appendChild(row);

			this.updateEntry(track);
		},
		//Updates track data table with current track data
		updateTrackTable: function() {
			//Grab track data
			var tracks = ftms_ui.simulator.tracks;
			var self = this;

			//If table is empty, add all existing tracks
			if(track_table.rows.length <= 1) {
				console.log(1);
				tracks.forEach(function(value, key, map){
					self.addEntry(value);
				});
				return;
			}

			//If no tracks exist, empty table
			if(tracks.size == 0) {
				console.log(2);
				while(track_table.rows.length > 1) {
					track_table.removeChild(track_table.rows[1]);
				}
				return;
			}

			//Update or add track's data
			tracks.forEach(function(value, key, map) {
				// console.log(key);
				for(var j = 1; j < track_table.rows.length; j++) {
					if(track_table.rows[j].cells[0].innerHTML == value.id) { //If track data is already on table
						// console.log('Update');
						self.updateEntry(value);
						break;
					} else if (j == track_table.rows.length-1) { //If not found
						// console.log('add');
						self.addEntry(value);
					}
				}
			});

			//Delete missing track's data
			for(var i = 1; i < track_table.rows.length; i++) {
				if(!tracks.has(Number(track_table.rows[i].cells[0].innerHTML))) {
					track_table.removeChild(track_table.rows[i--]);
				}
			}
		}
	}
}());