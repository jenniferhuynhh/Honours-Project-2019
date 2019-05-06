(function () {
	"use strict";

	Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNGM3NmUyMS0yNWY5LTQ5MmMtYjQ0ZS1hYTliMjY2MzFhYzYiLCJpZCI6OTcwNCwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1NDc3NTg2N30.U4oXqg5SHWnf22tUsRCb2aHrOp1aMF0TK3YmWC39Prc';

	//////////////////////////////////////////////////////////////////////////
	// Creating the Viewer
	//////////////////////////////////////////////////////////////////////////

	var viewer = new Cesium.Viewer("cesiumContainer", {
		selectionIndicator: false,
		baseLayerPicker: false
	});


	viewer.scene.mode = Cesium.SceneMode.SCENE2D;

	//////////////////////////////////////////////////////////////////////////
	// Loading Imagery
	//////////////////////////////////////////////////////////////////////////

	// Remove default base layer
	viewer.imageryLayers.remove(viewer.imageryLayers.get(0));

	// Add Sentinel-2 imagery
	viewer.imageryLayers.addImageryProvider(new Cesium.IonImageryProvider({ assetId: 3954 }));

	//////////////////////////////////////////////////////////////////////////
	// Loading Terrain
	//////////////////////////////////////////////////////////////////////////

	// Load Cesium World Terrain
	viewer.terrainProvider = Cesium.createWorldTerrain({
		requestWaterMask : true, // required for water effects
		requestVertexNormals : true // required for terrain lighting
	});
	// // Enable depth testing so things behind the terrain disappear.
	// viewer.scene.globe.depthTestAgainstTerrain = true;

	//////////////////////////////////////////////////////////////////////////
	// Configuring the Scene
	//////////////////////////////////////////////////////////////////////////

	// Enable lighting based on sun/moon positions
	viewer.scene.globe.enableLighting = true;

	// Create an initial camera view
	var initialPosition = new Cesium.Cartesian3.fromDegrees(138.45, -34.921230, 34000);
	var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(0, 0, 0);
	var homeCameraView = {
		destination : initialPosition,
		orientation : {
			heading : initialOrientation.heading,
			pitch : initialOrientation.pitch,
			roll : initialOrientation.roll
		}
	};
	// Set the initial view
	viewer.scene.camera.setView(homeCameraView);

	// Add some camera flight animation options
	homeCameraView.duration = 2.0;
	homeCameraView.maximumHeight = 2000;
	homeCameraView.pitchAdjustHeight = 2000;
	homeCameraView.endTransform = Cesium.Matrix4.IDENTITY;
	// Override the default home button
	viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (e) {
		e.cancel = true;
		viewer.scene.camera.flyTo(homeCameraView);
	});

	// Set up clock and timeline.
	viewer.clock.shouldAnimate = true; // default
	// viewer.clock.startTime = Cesium.JulianDate.fromIso8601("2017-07-11T16:00:00Z");
	// viewer.clock.stopTime = Cesium.JulianDate.fromIso8601("2017-07-11T16:20:00Z");
	// viewer.clock.currentTime = Cesium.JulianDate.fromIso8601("2017-07-11T16:00:00Z");
	// viewer.clock.multiplier = 2; // sets a speedup
	// viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER; // tick computation mode
	// viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // loop at the end
	// viewer.timeline.zoomTo(viewer.clock.startTime, viewer.clock.stopTime); // set visible range


	//////////////////////////////////////////////////////////////////////////
	// Simulator
	//////////////////////////////////////////////////////////////////////////

	var sim = new Simulator();
	sim.initialise();
	sim.run();

	function Simulator() {
		this.iterations = 20000; //number of iterations to perform
		this.i = 0; //current iteration
		this.tick_rate = 1; //tick time in seconds
		this.tracks = []; //array of tracks the field should display
		this.renderer; //the renderer linked to this sim

		//Initialises renderer and populates tracks
		this.initialise = function() {
			log("Simulator initialising...");

			//Create initial tracks
			this.tracks.push(new Track(138.455, -34.921235,"hostile"));
			this.tracks.push(new Track(138.42, -34.921225, "friendly"));
			this.tracks.push(new Track(138.46, -34.921254, "hostile"));
			this.tracks.push(new Track(138.45, -34.921240, "hostile"));
			this.tracks.push(new Track(138.43, -34.921230, "friendly"));

			//Create and link renderer
			this.renderer = new Renderer();
			this.renderer.initialise(this);
		};

		//Begins the tick cycle
		this.run = function() {
			log("Simulator running...");
			//Begin iterations
			this.tick();
		};

		//Recursive function that drives the simulator
		this.tick = function tick() {
			var self = this; //Store scope (https://stackoverflow.com/q/45147661)

			//Tell all tracks to move once
			for(var i = 0; i < this.tracks.length; i++) {
				this.tracks[i].go();
			}

			//Render new track positions
			this.renderer.render();

			// //Display data of new track positions
			// this.renderer.updateTrackTable();

			//Repeat every 'tick_rate' seconds
			if(++this.i == this.iterations) return; //Exit case
			setTimeout(function() {
				self.tick();
			}, this.tick_rate * 100);
		}
	};

	//////////////////////////////////////////////////////////////////////////
	// Renderer
	//////////////////////////////////////////////////////////////////////////

	function Renderer() {
		this.display; //the div the entire output will sit in
		this.windows; //the table that the components will display in
		this.field; //the table that tracks will be printed on
		this.track_table; //the table that track data will be displayed in
		this.bounds = [138, -32, 139, -35]; //top-left x,y point, bottom-right x,y point
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

			// //Generates tiled divs for this renderer's components to be displayed in (window manager)
			// this.generateDivs();

			// //Generate and show track field
			// this.generateField();

			// //Generate and show track info table
			// this.generateTrackTable();

			// //Generate and show track field controls
			// this.generateControls();

			// //Generate and show display settings
			// this.generateSettings();

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
			var ent = viewer.entities.getById(track.id);

			if (ent == undefined){
				var icon = 'images/friendly-ship.png';
				if(track.affiliation == "hostile") icon = 'images/enemy-ship.png';
				viewer.entities.add({
					id : track.id,
					// name : data["stnm"],
					show : true,
					description : `Affiliation: ${track.affiliation} <br> Longitude: ${track.longitude} <br> Latitude: ${track.latitude}`,
					position : Cesium.Cartesian3.fromDegrees(track.longitude, track.latitude, 0),
					billboard : {
						image : icon,
						scaleByDistance : new Cesium.NearFarScalar(0.0, 1, 2.0e5, 0.0)
					}
				});
			}
			else{
				ent.position = Cesium.Cartesian3.fromDegrees(track.longitude, track.latitude, 0);
				ent.description = `Affiliation: ${track.affiliation} <br> Longitude: ${track.longitude} <br> Latitude: ${track.latitude}`;
			}
		}

		//Renders the current state of the simulator
		this.render = function() {
			// //Clear previous tracks if toggled on
			// if(this.clear_tracks) this.clearField();

	 		//Grab new track data
			var tracks = this.sim.tracks;

			// viewer.entities.removeAll();
			
			//Paint tracks if not out of bounds
			for(var i = 0; i < tracks.length; i++) {
				// if(!(tracks[i].longitude < this.bounds[0] && tracks[i].longitude > this.bounds[2] && tracks[i].latitude > this.bounds[1] && tracks[i].latitude < this.bounds[3])) {
				// 	log("Track " + tracks[i].id + " is out of bounds!");
				// 	continue;
				// }
				this.paintTrack(tracks[i]);
			}
			// console.log(viewer.entities.values);
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

		// //Clears all rows except header from the track data table
		// this.clearTrackTable = function() {
		// 	for(var i = this.track_table.childNodes.length-1; i > 0; i--) {
		// 		this.track_table.deleteRow(i);
		// 	}
		// }

		// //Updates track data table with current track data
		// this.updateTrackTable = function() {
		// 	//Clear existing data
		// 	this.clearTrackTable();

		// 	//Grab new track data
		// 	var tracks = this.sim.tracks;

		// 	//Print tracks' data
		// 	for(var i = 0; i < tracks.length; i++) {
		// 		var row = document.createElement("tr");
				
		// 		var t = tracks[i];
		// 		var elements = [ //Track's elements to be displayed
		// 			t.id,
		// 			t.affiliation,
		// 			t.longitude.toFixed(8),
		// 			t.latitude.toFixed(8),
		// 			t.speed.toFixed(7),
		// 			t.course + "°",
		// 			t.type,
		// 			t.route
		// 		];

		// 		//Check if row should appear highlighted
		// 		if(t.highlighted) {
		// 			row.setAttribute("class", "highlighted_" + t.affiliation + "_data");
		// 		} else {
		// 			row.setAttribute("class", t.affiliation + "_data");
		// 		}

		// 		//Print data
		// 		for(var j = 0; j < elements.length; j++) {
		// 			var data = document.createElement("td");
		// 			data.appendChild(document.createTextNode(elements[j]));
		// 			row.appendChild(data);
		// 		}

		// 		//Handle track highlighting
		// 		var self = this; //Store current function scope
		// 		row.addEventListener("click", function() {
		// 			var track = global_tracks[this.childNodes[0].innerHTML];
		// 			track.highlighted = !track.highlighted;
		// 			self.updateTrackTable();
		// 			self.render();
		// 		});

		// 		this.track_table.appendChild(row);
		// 	}
		// }

		// //Generates and shows track information table
		// this.generateTrackTable = function() {
		// 	//Generate and store track data table element
		// 	this.track_table = document.createElement("table");
		// 	this.track_table.setAttribute("class", "track_table");
		// 	var elements = ["ID", "Affiliation", "Longitude", "Latitude", "Speed", "Course", "Type", "Route"];

		// 	//Print headers
		// 	var header = document.createElement("tr");
		// 	for(var i = 0; i < elements.length; i++) {
		// 		var td = document.createElement("td");
		// 		td.appendChild(document.createTextNode(elements[i]));
		// 		header.appendChild(td);
		// 	}
		// 	this.track_table.appendChild(header);

		// 	this.appendToDiv(this.track_table, 0, 1);

		// 	this.updateTrackTable();
		// }

		/********** MISC FUNCTIONS **********/
		
		//Generates the window manager's initial divs
		// this.generateDivs = function() {
		// 	this.windows = document.createElement("table");
		// 	this.windows.setAttribute("class", "window_manager");
		// 	for(var i = 0; i < 5; i++) {
		// 		var row = document.createElement("tr");
		// 		for(var j = 0; j < 5; j++) {
		// 			var td = document.createElement("td");
		// 			row.appendChild(td);
		// 		}
		// 		this.windows.appendChild(row);
		// 	}
		// 	this.display.appendChild(this.windows);
		// }

		// //Appends an element to a window
		// this.appendToDiv = function(element, row, column) {
		// 	this.windows.childNodes[row].childNodes[column].appendChild(element);
		// }

		// //Generates and shows display settings
		// this.generateSettings = function() {
		// 	//Store current function scope
		// 	var self = this;

		// 	//Toggle clearing tracks on/off
		// 	var clear_tracks_toggle = document.createElement("input");
		// 	clear_tracks_toggle.setAttribute("type", "checkbox");
		// 	clear_tracks_toggle.addEventListener("click", function() {
		// 		self.clear_tracks = !self.clear_tracks;
		// 	});

		// 	//Toggle background colour on/off
		// 	var background_toggle = document.createElement("input");
		// 	background_toggle.setAttribute("type", "checkbox");
		// 	//background_toggle.setAttribute("checked", "true");
		// 	background_toggle.addEventListener("click", function() {
		// 		if(self.field.style.backgroundColor == self.background_color) {
		// 			self.field.style.backgroundColor = "";
		// 		} else {
		// 			self.field.style.backgroundColor = self.background_color;
		// 		}
		// 	});

		// 	//Toggle gridlines on/off
		// 	var grid_toggle = document.createElement("input");
		// 	grid_toggle.setAttribute("type", "checkbox");
		// 	//grid_toggle.setAttribute("checked", "true");
		// 	grid_toggle.addEventListener("click", function() {
		// 		if(self.field.className == "border") {
		// 			self.field.className = "no_border";
		// 		} else {
		// 			self.field.className = "border";
		// 		}
		// 	});

		// 	//Combine setting options and display
		// 	var settings_box = document.createElement("p");
		// 	settings_box.appendChild(document.createTextNode("SETTINGS"));
		// 	settings_box.appendChild(document.createElement("br"));
		// 	settings_box.appendChild(document.createTextNode("Trailing tracks: "));
		// 	settings_box.appendChild(clear_tracks_toggle);
		// 	settings_box.appendChild(document.createElement("br"));
		// 	settings_box.appendChild(document.createTextNode("Background colour: "));
		// 	settings_box.appendChild(background_toggle);
		// 	settings_box.appendChild(document.createElement("br"));
		// 	settings_box.appendChild(document.createTextNode("Gridlines: "));
		// 	settings_box.appendChild(grid_toggle);

		// 	this.appendToDiv(settings_box, 0, 1);
		// }
	}

	//////////////////////////////////////////////////////////////////////////
	// Custom mouse interaction for highlighting and selecting
	//////////////////////////////////////////////////////////////////////////

	// If the mouse is over a point of interest, change the entity billboard scale and color
	// var previousPickedEntity;
	// var handler = viewer.screenSpaceEventHandler;
	// handler.setInputAction(function (movement) {
	// 	var pickedPrimitive = viewer.scene.pick(movement.endPosition);
	// 	var pickedEntity = Cesium.defined(pickedPrimitive) ? pickedPrimitive.id : undefined;
	// 	// Unhighlight the previously picked entity
	// 	if (Cesium.defined(previousPickedEntity)) {
	// 		previousPickedEntity.billboard.scale = 1.0;
	// 		previousPickedEntity.billboard.color = Cesium.Color.WHITE;
	// 	}
	// 	// Highlight the currently picked entity
	// 	if (Cesium.defined(pickedEntity) && Cesium.defined(pickedEntity.billboard)) {
	// 		pickedEntity.billboard.scale = 2.0;
	// 		pickedEntity.billboard.color = Cesium.Color.ORANGERED;
	// 		previousPickedEntity = pickedEntity;
	// 	}
	// }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

	// Finally, wait for the initial city to be ready before removing the loading indicator.
	// var loadingIndicator = document.getElementById('loadingIndicator');
	// loadingIndicator.style.display = 'block';
	// city.readyPromise.then(function () {
	//     loadingIndicator.style.display = 'none';
	// });

}());
