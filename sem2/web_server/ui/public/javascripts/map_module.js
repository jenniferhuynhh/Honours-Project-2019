var MapModule = (function() {
	//Private
	var ftms_ui; //FTMS UI system this module is linked to

	var display;
	var viewer;
	var icon_size = 15; //Size of milsymbol symbols
	var current_highlighted = null;

	//Public
	return {
		initialise: function(ftms) {
			//Link FTMS UI system
			ftms_ui = ftms;

			//Create div for map to load into
			display = document.createElement("div");
			display.style.height = "100%";

			"use strict";
			//Create the Cesium Viewer
			// Offline mode 
			viewer = new Cesium.Viewer(display, {
				imageryProvider : Cesium.createTileMapServiceImageryProvider({
					url : Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
				}),
				animation: false,
				selectionIndicator: false,
				timeline: false,
				baseLayerPicker : false,
				geocoder : false
			});

			// Online mode - Includes Imagery and Terrain sections
			// Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNTNlZjU4NS05ZDZlLTRiMTUtOGVmYi1lYTIwNjk2ODcyN2IiLCJpZCI6MTA2ODQsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NTcxNTk1ODl9.pefjm_v8G065frNjyPdGYd9ggHaMdKBfukjjMbgTg6M';
			// viewer = new Cesium.Viewer(display, {
			// 	animation: false,
			// 	selectionIndicator: false,
			// 	timeline: false,
			// 	baseLayerPicker: false
			// });

			viewer.scene.mode = Cesium.SceneMode.SCENE2D;

			//Remove entity-focusing upon double click
			viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

			//////////////////////////////////////////////////////////////////////////
			// Loading Imagery
			//////////////////////////////////////////////////////////////////////////

			// Remove default base layer
			// viewer.imageryLayers.remove(viewer.imageryLayers.get(0));

			// Add Sentinel-2 imagery
			// viewer.imageryLayers.addImageryProvider(new Cesium.IonImageryProvider({ assetId: 3954 }));

			//////////////////////////////////////////////////////////////////////////
			// Loading Terrain
			//////////////////////////////////////////////////////////////////////////

			// Load Cesium World Terrain
			// viewer.terrainProvider = Cesium.createWorldTerrain({
			// 	requestWaterMask : true, // required for water effects
			// 	requestVertexNormals : true // required for terrain lighting
			// });

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
			viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function(e) {
				e.cancel = true;
				viewer.scene.camera.flyTo(homeCameraView);
			});

			//////////////////////////////////////////////////////////////////////////
			// Custom mouse interaction for highlighting and selecting
			//////////////////////////////////////////////////////////////////////////

			//Handle on-click track icon selecting
			var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
			handler.setInputAction(click => {
				var pickedObject = viewer.scene.pick(click.position);
				if(Cesium.defined(pickedObject)) { //If clicked on a track icon
					var clicked_track = ftms_ui.track_manager.getTrack(viewer.selectedEntity.id);
					clicked_track.selected(); //Select/unselect that icon's track
				} else { //If clicked on empty space on the map
					if(current_highlighted) current_highlighted.selected(); //Unselect current selected track
				}
			}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

			//Create new icon entity when new track is created
			ftms_ui.track_manager.addEventListener("create", track => {
				//Create icon entity for the track
				var ent = viewer.entities.add({
					id: track.trackId,
					name: "ID: " + track.trackId,
					description: "Affiliation: " + track.affiliation + "<br>Longitude: " + track.longitude + "<br>Latitude: " + track.latitude + "<br>Altitude: " + track.altitude,
					position: Cesium.Cartesian3.fromDegrees(track.longitude, track.latitude, track.altitude),
					billboard: {
						image: this.makeIcon(track)
					}
				});

				//When track is updated, update the icon's properties
				track.addEventListener("update", () => {
					ent.description = "Affiliation: " + track.affiliation + "<br>Longitude: " + track.longitude + "<br>Latitude: " + track.latitude + "<br>Altitude: " + track.altitude;
					ent.position = Cesium.Cartesian3.fromDegrees(track.longitude, track.latitude, track.altitude);
					ent.billboard.image = this.makeIcon(track);
				});
			});

			//When new track is selected, update icon's and viewer's appearances
			ftms_ui.track_manager.addEventListener("selected", track => {
				var old_highlighted = current_highlighted;
				current_highlighted = track;
				if(old_highlighted) { //If track was previously selected, unhighlight it
					var old_ent = viewer.entities.getById(old_highlighted.trackId);
					old_ent.billboard.image = this.makeIcon(old_highlighted);
				}
				//Highlight newly selected track
				var ent = viewer.entities.getById(current_highlighted.trackId);
				ent.billboard.image = this.makeIcon(current_highlighted);
				viewer.selectedEntity = ent;
			});

			//When track is unselected, update icon's and viewer's appearances
			ftms_ui.track_manager.addEventListener("unselected", () => {
				var old_highlighted = current_highlighted;
				current_highlighted = null;
				//Unhighlight previously selected track
				var old_ent = viewer.entities.getById(old_highlighted.trackId);
				old_ent.billboard.image = this.makeIcon(old_highlighted);
				viewer.selectedEntity = null;
			});

			ftms_ui.window_manager.appendToWindow('Map Module', display);
		},

		makeIcon(track) {
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

			var color_mode = "Light";
			if(current_highlighted == track) color_mode = "Dark";

			return new ms.Symbol(icon_id, {size: icon_size, colorMode: color_mode}).asCanvas();
		},

		//Erases track from viewer
		eraseTrack: function(id) {
			var ent = viewer.entities.getById(id);
			viewer.entities.remove(ent);
		}
	}
}());