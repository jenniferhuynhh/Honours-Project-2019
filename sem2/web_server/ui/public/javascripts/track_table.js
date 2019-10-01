var TrackTableModule = (function() {
	//Private
	var ftms_ui; //FTMS UI system this module is linked to

	var display;
	var rows = new Map();
	var current_highlighted = null;

	//Public
	return {
		initialise: function(ftms) {
			//Link FTMS UI system
			ftms_ui = ftms;
			display = document.createElement('div');
			display.classList.add('track_table_display');

			//Generate and store track data table element
			var track_table = document.createElement("table");
			track_table.classList.add("track_table");

			//Print headers
			var header_elements = ["ID", "Affiliation", "Latitude", "Longitude", "Speed", "Course"];
			var header = document.createElement("tr");
			for(var i = 0; i < header_elements.length; i++) {
				var th = document.createElement("th");
				th.appendChild(document.createTextNode(header_elements[i]));
				header.appendChild(th);
			}
			track_table.appendChild(header);
			display.appendChild(track_table);

			//Create row when new track is created
			ftms_ui.track_manager.addEventListener("create", track => {
				var row = new Row(track);
				rows.set(track.trackId, row);
				track_table.appendChild(row.display);
			});

			//Handle a track being selected
			ftms_ui.track_manager.addEventListener("selected", track => {
				//Unselect current selected track, select new one
				if(current_highlighted) current_highlighted.selected(false);
				current_highlighted = rows.get(track.trackId);
				current_highlighted.selected(true);
			});

			//Handle a track being unselected
			ftms_ui.track_manager.addEventListener("unselected", track => {
				current_highlighted.selected(false);
				current_highlighted = null;
			});

			ftms_ui.window_manager.appendToWindow('Track Table Module', display);
		}
	}
}());

class Row {
	constructor(track) {
		this.track = track;

		//Create display
		this.display = document.createElement("tr");
		this.display.classList.add("class", this.track.affiliation + "_data");

		var elements = this.trackElements(this.track);
		for(var i = 0; i < elements.length; i++) {
			var cell = document.createElement("td");
			cell.appendChild(document.createTextNode(elements[i]));
			this.display.appendChild(cell);
		}

		this.display.addEventListener("click", () => this.track.selected());

		//When track is updated, update elements
		this.track.addEventListener("update", () => {
			//Update row styling
			for(var i = 0; i < this.display.classList.length; i++) { //Remove current affiliation class, but keep highlighting if present
				if(this.display.classList[i].includes("_data")) {
					this.display.classList.remove(this.display.classList[i--]);
					break;
				}
			}
			this.display.classList.add("class", this.track.affiliation + "_data");

			//Update row info
			var elements = this.trackElements(this.track);
			for(var i = 0; i < elements.length; i++) {
				this.display.cells[i].childNodes[0].nodeValue = elements[i];
			}
		});

		//When track is deleted, remove this row
		this.track.addEventListener("delete", () => this.display.remove());
	}

	selected() {
		this.display.classList.toggle("highlighted");
	}

	//HELPER
	trackElements(track) {
		var elements = [ //Track's elements to be displayed
			track.trackId,
			track.affiliation,
			track.latitude.toFixed(8),
			track.longitude.toFixed(8),
			track.speed.toFixed(3) + " knots",
			track.course.toFixed(3) + "°"
		];
		return elements;
	}
}