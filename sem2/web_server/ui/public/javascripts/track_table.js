var TrackTableModule = (function() {
	//Private
	var ftms_ui; //FTMS UI system this module is linked to

	var display;
	var rows;
	var current_highlighted;
	var deleting_row;

	//Public
	return {
		initialise: function(ftms) {
			//Link FTMS UI system
			ftms_ui = ftms;
			display = document.createElement('div');
			display.classList.add('track_table_display');

			rows = new Map();
			current_highlighted = null;

			//Generate and store track data table element
			var track_table = document.createElement("table");
			track_table.classList.add("track_table");

			//Print headers
			var header_elements = ["ID", "Affiliation", "Latitude", "Longitude", "Speed", "Course", ""];
			var header = document.createElement("tr");
			for(var i = 0; i < header_elements.length; i++) {
				var th = document.createElement("th");
				th.appendChild(document.createTextNode(header_elements[i]));
				header.appendChild(th);
			}
			header.cells[6].classList.add("delete_cell");
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

			ftms_ui.window_manager.appendToWindow('Track Table', display);
		},

		//Scrolls the table to selected track's row. Animation can be changed between smooth and instant - behaviour: ('smooth'|'auto') respectively
		scrollToSelected: function() {
			if(current_highlighted) current_highlighted.display.scrollIntoView({behavior: "smooth", block: "center"});
		}
	}
}());

class Row {
	constructor(track) {
		this.track = track;
		this.delete_state = 0;

		//Create display
		this.display = document.createElement("tr");
		this.display.classList.add("class", this.track.affiliation + "_data");

		var props = this.trackProperties(this.track);
		for(var i = 0; i < props.length; i++) {
			var cell = document.createElement("td");
			cell.appendChild(document.createTextNode(props[i]));
			if(i + 1 != props.length) cell.addEventListener("click", () => this.track.selected()); //Add track-selection to all cells except delete cell
			this.display.appendChild(cell);
		}

		if(track.manual) {
			var delete_cell = this.display.cells[this.display.cells.length-1];
			delete_cell.classList.add("delete_cell");
			delete_cell.addEventListener("click", () => {
				this.progressDeleteState();
				setTimeout(() => { //Reset delete button if not clicked within x milliseconds
					if(this.delete_state == 1) {
						this.resetDeleteState();
					}
				}, 1500)
			});
		}

		//When track is updated, update cells
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
			var props = this.trackProperties(this.track);
			for(var i = 0; i < props.length; i++) {
				this.display.cells[i].childNodes[0].nodeValue = props[i];
			}
		});

		//When track is deleted, remove this row
		this.track.addEventListener("delete", () => this.display.remove());
	}

	selected() {
		this.display.classList.toggle("highlighted");
	}

	progressDeleteState() {
		if(this.delete_state == 0) {
			this.delete_state++;
			this.display.cells[this.display.cells.length-1].childNodes[0].nodeValue = "[✓]";
		} else if(this.delete_state == 1) {
			this.track.delete();
		}
	}

	resetDeleteState() {
		this.delete_state = 0;
		this.display.cells[this.display.cells.length-1].childNodes[0].nodeValue = "[✗]";
	}

	//HELPER
	trackProperties(track) {
		var props = [ //Track's props to be displayed
			track.trackId,
			track.affiliation,
			track.latitude.toFixed(8),
			track.longitude.toFixed(8),
			track.speed.toFixed(3) + " knots",
			track.course.toFixed(3) + "°",
			""
		];

		if(track.manual) {
			props[0] = "*" + props[0];
			props[props.length-1] = this.delete_state == 1 ? "[✓]" : "[✗]";
		}
		return props;
	}
}