function TrackTableModule() {
	this.ftms_ui; //FTMS UI system this module is linked to
	this.track_table; //the table that track data will be displayed in

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

	//Clears all rows except header from the track data table
	this.clearTrackTable = function() {
		for(var i = this.track_table.childNodes.length-1; i > 0; i--) {
			this.track_table.deleteRow(i);
		}
	}

	//Updates track data table with current track data
	this.updateTrackTable = function() {
		//Clear existing data
		this.clearTrackTable();

		//Grab new track data
		var tracks = this.ftms_ui.simulator.tracks;

		//Print tracks' data
		for(var i = 0; i < tracks.length; i++) {
			var row = document.createElement("tr");
			
			var t = tracks[i];
			var elements = [ //Track's elements to be displayed
				t.id,
				t.affiliation,
				t.latitude.toFixed(8),
				t.longitude.toFixed(8),
				t.speed.toFixed(7),
				t.course + "°",
				t.type,
				t.route
			];

			//Check if row should appear highlighted
			if(t.highlighted) {
				row.setAttribute("class", "highlighted_" + t.affiliation + "_data");
			} else {
				row.setAttribute("class", t.affiliation + "_data");
			}

			//Print data
			for(var j = 0; j < elements.length; j++) {
				var data = document.createElement("td");
				data.appendChild(document.createTextNode(elements[j]));
				row.appendChild(data);
			}

			//Handle track highlighting
			var self = this; //Store current function scope
			row.addEventListener("click", function() {
				var track = global_tracks[this.childNodes[0].innerHTML];
				track.highlighted = !track.highlighted;
				self.updateTrackTable();
			});

			this.track_table.appendChild(row);
		}
	}
}