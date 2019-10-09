var TrackTableModule = (function() {
	//Private
	var ftms_ui; //FTMS UI system this module is linked to
	var display;
	var track_table; //the table that track data will be displayed in
	var header_elements; //Labels to be displayed in header
	var deleting_row;

	//Public
	return {
		initialise: function(ftms) {
			//Link FTMS UI system
			ftms_ui = ftms;
			display = document.createElement('div');
			display.setAttribute('class', 'track_table_display');

			//Generate and store track data table element
			track_table = document.createElement("table");
			track_table.setAttribute("class", "track_table");

			//Print headers
			header_elements = ["ID", "Affiliation", "Latitude", "Longitude", "Speed", "Course", ""];
			var header = document.createElement("tr");
			for(var i = 0; i < header_elements.length; i++) {
				var th = document.createElement("th");
				th.appendChild(document.createTextNode(header_elements[i]));
				header.appendChild(th);
			}
			header.cells[6].classList.add("delete_cell");
			track_table.appendChild(header);
			display.appendChild(track_table);

			//Show table
			ftms_ui.window_manager.appendToWindow('Track Table Module', display);

			ftms_ui.track_manager.setListener(this);
			this.update();
		},
		//Updates given track's row
		updateEntry: function(track) {
			//Find track's row
			var row;
			for(var i = 1; i < track_table.rows.length; i++) {
				if(track_table.rows[i].cells[0].innerHTML.replace("*","") == track.id) {
					row = track_table.rows[i];
				}
			}

			//Highlight the selected row
			if(ftms_ui.track_manager.getSelectedTrack() == track) {
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
			if(track.manual) {
				elements[0] = "*" + elements[0];
				elements.push("[✗]");
				if(track.id == deleting_row) elements[6] = "[✓]";
			}

			//Print data
			for(var i = 0; i < elements.length; i++) {
				row.cells[i].innerHTML = "";
				row.cells[i].appendChild(document.createTextNode(elements[i]));
			}
		},
		//Creates row for a given track
		addEntry: function(track) {
			var row = document.createElement("tr");

			//Handle track selecting
			var self = this;
			row.addEventListener("click", function() {
				var row_track = ftms_ui.track_manager.getTrack(this.cells[0].innerHTML);
				if(ftms_ui.track_manager.getSelectedTrack() == row_track) { //Unselect
					ftms_ui.track_manager.setSelectedTrack(null);
					ftms_ui.map_module.getViewer().selectedEntity = undefined;
				} else { //Select
					ftms_ui.track_manager.setSelectedTrack(row_track);
					if(row_track) ftms_ui.map_module.getViewer().selectedEntity = ftms_ui.map_module.getViewer().entities.getById(row_track.id)
				}
			});

			//Create cells
			for(var i = 0; i < header_elements.length; i++) {
				var data = document.createElement("td");
				if(track.manual && i == 6) {
					//Give option to delete track
					data.classList.add("delete_cell");
					data.addEventListener("click", function() {
						if(track.id == deleting_row) {
							ftms_ui.track_manager.deleteTrack(track.id);
							ftms_ui.map_module.eraseTrack(track.id);
						} else {
							deleting_row = track.id;
						}
					});
				}
				row.appendChild(data);
			}

			//Print track's id in first row and add to table
			row.cells[0].innerHTML = track.id;
			track_table.appendChild(row);

			this.updateEntry(track);
		},
		//Updates track data table with current track data
		update: function() {
			//Grab track data
			var tracks = ftms_ui.track_manager.getTracks();
			var self = this;

			//If table is empty, add all existing tracks
			if(track_table.rows.length <= 1) {
				tracks.forEach(function(value, key){
					self.addEntry(value);
				});
				return;
			}

			//If no tracks exist, empty table
			if(tracks.size == 0) {
				while(track_table.rows.length > 1) {
					track_table.removeChild(track_table.rows[1]);
				}
				return;
			}

			//Update or add track's data
			tracks.forEach(function(value, key) {
				for(var i = 1; i < track_table.rows.length; i++) {
					if(track_table.rows[i].cells[0].innerHTML.replace("*","") == value.id) { //If track data is already on table
						self.updateEntry(value);
						break;
					} else if (i == track_table.rows.length-1) { //If not found
						self.addEntry(value);
					}
				}
			});

			//Delete missing track's data
			for(var i = 1; i < track_table.rows.length; i++) {
				if(!tracks.has(Number(track_table.rows[i].cells[0].innerHTML.replace("*","")))) {
					track_table.removeChild(track_table.rows[i--]);
				}
			}
		}
	}
}());