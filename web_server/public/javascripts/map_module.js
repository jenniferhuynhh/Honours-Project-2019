function MapModule() {
	this.ftms_ui; //FTMS UI system this module is linked to
	this.width = 1000;
	this.height = 600;
	this.viewer;

	this.initialise = function(ftms_ui) {
		//Link FTMS UI system
		this.ftms_ui = ftms_ui;

		//Create div for map to load into and append to a window
		var div = document.createElement("div");
		div.setAttribute("id", "cesiumContainer");
		this.ftms_ui.window_manager.appendToWindow(div, 0, 0);

		//Set size of window
		var display = this.ftms_ui.window_manager.getWindow(0, 0);
		display.style.width = this.width + "px";
		display.style.height = this.height + "px";

		//Create the Cesium Viewer
		"use strict";
		Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNGM3NmUyMS0yNWY5LTQ5MmMtYjQ0ZS1hYTliMjY2MzFhYzYiLCJpZCI6OTcwNCwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1NDc3NTg2N30.U4oXqg5SHWnf22tUsRCb2aHrOp1aMF0TK3YmWC39Prc';
		this.viewer = new Cesium.Viewer("cesiumContainer", {
			selectionIndicator: false,
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
	}
};
