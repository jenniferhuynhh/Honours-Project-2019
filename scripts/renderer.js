function Renderer() {
	this.display_id = "tracking_sim"; //element ID this renderer should display output in
	this.display; //the div the entire output will sit in
	this.windows; //the table that the components will display in
	this.field; //the table that tracks will be printed on
	this.track_table; //the table that track data will be displayed in
	this.bounds = [-34.912800, 138.365500, -34.913100, 138.365800]; //top-left x,y point, bottom-right x,y point
	this.rows = 150; //rows/columns of field; determines accuracy
	this.columns = 150;
	this.zoom = 15 //(%) multiplier for a single zoom in
	this.longitude_range = Math.abs(this.bounds[3]-this.bounds[1]);
	this.latitude_range = Math.abs(this.bounds[2]-this.bounds[0]);
	this.sim; //the simulator this renderer is linked to
	this.background_color = "rgb(234, 250, 255)"; //table's background colour
	this.clear_tracks = true; //decides if tracks should leave trails or not

	//Initialises renderer (field, settings) and links to simulator
	this.initialise = function(sim) {
		log("Renderer initialising...");

		//Link the simulator
		this.sim = sim;

		//Find area to display
		this.display = document.getElementById(this.display_id);

		//Generates tiled divs for this renderer's components to be displayed in (window manager)
		this.generateDivs();

		//Generate and show track field
		this.generateField();

		//Generate and show track info table
		this.generateTrackTable();

		//Generate and show track field controls
		this.generateControls();

		//Generate and show display settings
		this.generateSettings();

		log("Renderer initialised");
	};

	/********** FIELD FUNCTIONS **********/

	this.darken = function(colour) {
		rgb = colour.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
		for(var i = 0; i < rgb.length; i++) {rgb[i] *= 0.5}
		return "rgb(" + rgb[1] + "," + rgb[2] + "," + rgb[3] + ")"
	}

	//Clears all cells of field
	this.clearField = function() {
		for(var i = 0; i < this.field.rows.length; i++) {
			for(var j = 0; j < this.field.rows[i].cells.length; j++) {
				this.field.rows[i].cells[j].style.backgroundColor = "";
				//this.field.rows[i].cells[j].removeAttribute("style");
			}
		}
	}

	//Paints a given track onto the field
	this.paintTrack = function(track) {
		//Calculate which table cell the track should be displayed in
		var row = Math.floor(((Math.abs(track.longitude - this.bounds[0])) / this.latitude_range) * this.columns);
		var column = Math.floor(((Math.abs(track.latitude - this.bounds[1])) / this.longitude_range) * this.rows)
		var cell = this.field.rows[row].cells[column];

		//Colour track according to affiliation
		var colour = "#00ffff"; //friendly colour (cyan)
		if(track.affiliation == "hostile") colour = "#f25959";
		//if(track.highlighted) colour = "black";
		cell.style.backgroundColor = colour;
		if(track.highlighted) cell.style.backgroundColor = darken(cell.style.backgroundColor);
	}

	//Renders the current state of the simulator
	this.render = function() {
		//Clear previous tracks if toggled on
		if(this.clear_tracks) this.clearField();

 		//Grab new track data
		var tracks = this.sim.tracks;

		//Paint tracks if not out of bounds
		for(var i = 0; i < tracks.length; i++) {
			if(!(tracks[i].longitude < this.bounds[0] && tracks[i].longitude > this.bounds[2] && tracks[i].latitude > this.bounds[1] && tracks[i].latitude < this.bounds[3])) {
				log("Track " + tracks[i].id + " is out of bounds!");
				continue;
			}
			this.paintTrack(tracks[i]);
		}
	};

	//Generates and shows the field table
	this.generateField = function() {
		//Create field table
		this.field = document.createElement("table")
		this.field.setAttribute("class", "no_border");
		//this.field.style.backgroundColor = this.background_color;

		//Create cells of field
		for(var i = 0; i < this.rows; i++) {
			var row = document.createElement("tr");
			for(var j = 0; j < this.columns; j++) {
				var td = document.createElement("td");
				row.appendChild(td);
			}
			this.field.appendChild(row);
		}

		this.appendToDiv(this.field, 0, 0);
	}

	//Generates and shows controls for the track field
	this.generateControls = function() {

		//Create controls grid
		var grid = []
		for(var i = 0; i < 2; i++) {
			grid[i] = []
			for(var j = 0; j < 3; j++) {
				grid[i][j] = document.createElement("td");
			}
		}

		var up_button = document.createElement("input");
		up_button.setAttribute("type", "button");
		up_button.setAttribute("value", "↑");
		grid[0][1].appendChild(up_button);

		var left_button = document.createElement("input");
		left_button.setAttribute("type", "button");
		left_button.setAttribute("value", "←");
		grid[1][0].appendChild(left_button);

		var down_button = document.createElement("input");
		down_button.setAttribute("type", "button");
		down_button.setAttribute("value", "↓");
		grid[1][1].appendChild(down_button);

		var right_button = document.createElement("input");
		right_button.setAttribute("type", "button");
		right_button.setAttribute("value", "→");
		grid[1][2].appendChild(right_button);

		var self = this; //store current scope
		function zoom(scalar) { //Multiply bounds accordingly and update ranges
			scalar /= 200;
			//Calculate new range
			var long = self.longitude_range*scalar;
			var lat = self.latitude_range*scalar;
			//Distribute new range
			self.bounds[0] -= lat;
			self.bounds[1] += long;
			self.bounds[2] += lat;
			self.bounds[3] -= long;
			//Update new range
			self.longitude_range = Math.abs(self.bounds[3]-self.bounds[1]);
			self.latitude_range = Math.abs(self.bounds[2]-self.bounds[0]);
			self.clearField();
			self.render();
		}

		var zoom_in = document.createElement("input");
		zoom_in.setAttribute("type", "button");
		zoom_in.setAttribute("value", "+");
		zoom_in.addEventListener("click", function(){zoom(self.zoom)});
		grid[0][0].appendChild(zoom_in);

		var zoom_out = document.createElement("input");
		zoom_out.setAttribute("type", "button");
		zoom_out.setAttribute("value", "-");
		zoom_out.addEventListener("click", function(){zoom(-self.zoom)});
		grid[0][2].appendChild(zoom_out);


		//Turn control grid into HTML
		var controls = document.createElement("table");
		controls.setAttribute("class", "controls_table");
		for(var i = 0; i < grid.length; i++) {
			var row = document.createElement("tr");
			for(var j = 0; j < grid[i].length; j++) {
				row.appendChild(grid[i][j]);
			}
			controls.appendChild(row);
		}

		this.appendToDiv(controls, 0, 1);
	}

	/********** TRACK TABLE FUNCTIONS **********/

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
		var tracks = this.sim.tracks;

		//Print tracks' data
		for(var i = 0; i < tracks.length; i++) {
			var row = document.createElement("tr");
			
			var t = tracks[i];
			var elements = [ //Track's elements to be displayed
				t.id,
				t.affiliation,
				t.longitude.toFixed(8),
				t.latitude.toFixed(8),
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
				self.render();
			});

			this.track_table.appendChild(row);
		}
	}

	//Generates and shows track information table
	this.generateTrackTable = function() {
		//Generate and store track data table element
		this.track_table = document.createElement("table");
		this.track_table.setAttribute("class", "track_table");
		var elements = ["ID", "Affiliation", "Longitude", "Latitude", "Speed", "Course", "Type", "Route"];

		//Print headers
		var header = document.createElement("tr");
		for(var i = 0; i < elements.length; i++) {
			var td = document.createElement("td");
			td.appendChild(document.createTextNode(elements[i]));
			header.appendChild(td);
		}
		this.track_table.appendChild(header);

		this.appendToDiv(this.track_table, 0, 1);

		this.updateTrackTable();
	}

	/********** MISC FUNCTIONS **********/
	
	//Generates the window manager's initial divs
	this.generateDivs = function() {
		this.windows = document.createElement("table");
		this.windows.setAttribute("class", "window_manager");
		for(var i = 0; i < 5; i++) {
			var row = document.createElement("tr");
			for(var j = 0; j < 5; j++) {
				var td = document.createElement("td");
				row.appendChild(td);
			}
			this.windows.appendChild(row);
		}
		this.display.appendChild(this.windows);
	}

	//Appends an element to a window
	this.appendToDiv = function(element, row, column) {
		this.windows.childNodes[row].childNodes[column].appendChild(element);
	}

	//Generates and shows display settings
	this.generateSettings = function() {
		//Store current function scope
		var self = this;

		//Toggle clearing tracks on/off
		var clear_tracks_toggle = document.createElement("input");
		clear_tracks_toggle.setAttribute("type", "checkbox");
		clear_tracks_toggle.addEventListener("click", function() {
			self.clear_tracks = !self.clear_tracks;
		});

		//Toggle background colour on/off
		var background_toggle = document.createElement("input");
		background_toggle.setAttribute("type", "checkbox");
		//background_toggle.setAttribute("checked", "true");
		background_toggle.addEventListener("click", function() {
			if(self.field.style.backgroundColor == self.background_color) {
				self.field.style.backgroundColor = "";
			} else {
				self.field.style.backgroundColor = self.background_color;
			}
		});

		//Toggle gridlines on/off
		var grid_toggle = document.createElement("input");
		grid_toggle.setAttribute("type", "checkbox");
		//grid_toggle.setAttribute("checked", "true");
		grid_toggle.addEventListener("click", function() {
			if(self.field.className == "border") {
				self.field.className = "noborder";
			} else {
				self.field.className = "border";
			}
		});

		//Combine setting options and display
		var settings_box = document.createElement("p");
		settings_box.appendChild(document.createTextNode("SETTINGS"));
		settings_box.appendChild(document.createElement("br"));
		settings_box.appendChild(document.createTextNode("Trailing tracks: "));
		settings_box.appendChild(clear_tracks_toggle);
		settings_box.appendChild(document.createElement("br"));
		settings_box.appendChild(document.createTextNode("Background colour: "));
		settings_box.appendChild(background_toggle);
		settings_box.appendChild(document.createElement("br"));
		settings_box.appendChild(document.createTextNode("Gridlines: "));
		settings_box.appendChild(grid_toggle);

		this.appendToDiv(settings_box, 0, 1);
	}
}