function MapModule() {
	this.ftms_ui; //FTMS UI system this module is linked to
	this.icon_size = 15; //Size of milsymbol symbols
	this.display;
	this.viewer;
	
	this.initialise = function(ftms_ui) {
		log("Map module initialising...");

		//Link FTMS UI system
		this.ftms_ui = ftms_ui;

		//Create div for map to load into
		this.display = document.createElement("div");

		//Create the Cesium Viewer
		"use strict";
		Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNTNlZjU4NS05ZDZlLTRiMTUtOGVmYi1lYTIwNjk2ODcyN2IiLCJpZCI6MTA2ODQsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NTcxNTk1ODl9.pefjm_v8G065frNjyPdGYd9ggHaMdKBfukjjMbgTg6M';
		//Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNGM3NmUyMS0yNWY5LTQ5MmMtYjQ0ZS1hYTliMjY2MzFhYzYiLCJpZCI6OTcwNCwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1NDc3NTg2N30.U4oXqg5SHWnf22tUsRCb2aHrOp1aMF0TK3YmWC39Prc';
		
		this.viewer = new Cesium.Viewer(this.display, {
			animation: false,
			selectionIndicator: false,
			timeline: false,
			baseLayerPicker: false
		});

		var viewer = this.viewer;
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
		var initialPosition = new Cesium.Cartesian3.fromDegrees(56.78, 26.5731, 34000);
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
		// viewer.clock.shouldAnimate = true; // default
		// viewer.clock.startTime = Cesium.JulianDate.fromIso8601("2017-07-11T16:00:00Z");
		// viewer.clock.stopTime = Cesium.JulianDate.fromIso8601("2017-07-11T16:20:00Z");
		// viewer.clock.currentTime = Cesium.JulianDate.fromIso8601("2017-07-11T16:00:00Z");
		// viewer.clock.multiplier = 2; // sets a speedup
		// viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER; // tick computation mode
		// viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // loop at the end
		// viewer.timeline.zoomTo(viewer.clock.startTime, viewer.clock.stopTime); // set visible range


		//////////////////////////////////////////////////////////////////////////
		// Custom mouse interaction for highlighting and selecting
		//////////////////////////////////////////////////////////////////////////

		//Handle on-click entity selecting
		var self = this;
		var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
		handler.setInputAction(function(click) {
			var pickedObject = viewer.scene.pick(click.position);
			if(Cesium.defined(pickedObject)) {
				self.ftms_ui.track_table_module.selected_track_id = viewer.selectedEntity.id;
			} else {
				self.ftms_ui.track_table_module.selected_track_id = -1;
			}
			self.ftms_ui.track_table_module.updateTrackTable();
			self.ftms_ui.classification_module.updateDisplay();
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

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

		this.ftms_ui.window_manager.appendToWindow('Map Module', this.display);
	
		log("Map module initialised");
	}

	//Places/updates a track on viewer
	this.paintTrack = function(track) {
		var ent = this.viewer.entities.getById(track.id);

		//Decide which military symbol icon to use (uses milsymbol library)
		var icon_id = 102000;
		switch(track.affiliation) {
			case "friendly": 	icon_id += 300;
								break;
			case "hostile": 	icon_id += 600;
								break;
			case "neutral": 	icon_id += 400;
								break;
			case "unknown": 	icon_id += 100;
								break;
		}
		switch(track.domain) {
			case "air": 		icon_id += 1;
								break;
			case "land": 		icon_id += 10;
								break;
			case "sea": 		icon_id += 15;
								break;
			case "subsurface": 	icon_id += 35;
								break;
		}

		//Create milsymbol
		var color_mode = 'Light';
		if (this.ftms_ui.track_table_module.selected_track_id == track.id) {
			color_mode = 'Dark';
		}
		var icon = new ms.Symbol(icon_id, {size: this.icon_size, colorMode: color_mode}).asCanvas();

		//Create or update entity
		if(ent == undefined) {
			this.viewer.entities.add({
				id: track.id,
				name: `ID: ${track.id}`,
				show: true,
				description: `Affiliation: ${track.affiliation} <br> Longitude: ${track.longitude} <br> Latitude: ${track.latitude} <br> Altitude: ${track.altitude}`,
				position: Cesium.Cartesian3.fromDegrees(track.longitude, track.latitude, track.altitude),
				billboard: {
					image: icon
				}
			});
		} else {
			ent.billboard.image = icon;
			ent.position = Cesium.Cartesian3.fromDegrees(track.longitude, track.latitude, track.altitude);
			ent.description = `Affiliation: ${track.affiliation} <br> Latitude: ${track.latitude} <br> Longitude: ${track.longitude} <br> Altitude: ${track.altitude}`;
		}
	}

	//Erases track from viewer
	this.eraseTrack = function(id) {
		var ent = this.viewer.entities.getById(id);
		this.viewer.entities.remove(ent);
	}

	//Renders the current state of the simulator
	this.render = function() {
		//Grab new track data
		var tracks = this.ftms_ui.simulator.tracks;
		
		//Paint tracks
		for(var i = 0; i < tracks.length; i++) {
			this.paintTrack(tracks[i]);
		}
	};
};
