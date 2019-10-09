var MapModule = (function() {
	//Private
	var ftms_ui; //FTMS UI system this module is linked to
	var icon_size = 15; //Size of milsymbol symbols
	var display;
	var viewer;
	var mode = "normal";

	//Public
	return {
		initialise: function(ftms) {
			//Link FTMS UI system
			ftms_ui = ftms;

			//Create div for map to load into
			display = document.createElement("div");
			display.style.height = "100%";

			//Create the Cesium Viewer
			"use strict";
			Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNTNlZjU4NS05ZDZlLTRiMTUtOGVmYi1lYTIwNjk2ODcyN2IiLCJpZCI6MTA2ODQsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NTcxNTk1ODl9.pefjm_v8G065frNjyPdGYd9ggHaMdKBfukjjMbgTg6M';
			//Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNGM3NmUyMS0yNWY5LTQ5MmMtYjQ0ZS1hYTliMjY2MzFhYzYiLCJpZCI6OTcwNCwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1NDc3NTg2N30.U4oXqg5SHWnf22tUsRCb2aHrOp1aMF0TK3YmWC39Prc';
			
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
			// viewer = new Cesium.Viewer(display, {
			// 	animation: false,
			// 	selectionIndicator: false,
			// 	timeline: false,
			// 	baseLayerPicker: false
			// });

			viewer.scene.mode = Cesium.SceneMode.SCENE2D;

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

			/////////////////////////////////////////////////////////////////////////////////
			// Custom mouse interaction for highlighting, selecting and manual track placing
			/////////////////////////////////////////////////////////////////////////////////

			//Manual track handling
			var manual_track_div = document.createElement("div");
			var manual_track_button = document.createElement("button");
			manual_track_button.innerHTML = "Manual";
			manual_track_button.classList.add( "manual-track-button", "custom-cesium-button", "custom-cesium-toolbar-button");
			manual_track_button.addEventListener("click", function() { //Toggles manual mode on/off
				if(mode != "manual") {
					mode = "manual";
				} else if(mode == "manual") {
					mode = "normal";
				}
				this.classList.toggle("active");
			});
			manual_track_div.appendChild(manual_track_button);
			display.appendChild(manual_track_div);

			viewer.canvas.addEventListener('click', function(e) {
				if(mode == "manual") {
					mode = "normal";
					manual_track_button.classList.toggle("active");

					var correctedX = e.clientX - display.getBoundingClientRect().left; //Corrects mouse position to account for position of viewer on screen
					var correctedY = e.clientY - display.getBoundingClientRect().top;
					var ellipsoid = viewer.scene.globe.ellipsoid;
					var cartesian = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(correctedX, correctedY), ellipsoid);
					if(cartesian) {
						var cartographic = ellipsoid.cartesianToCartographic(cartesian);
						var longitude = Cesium.Math.toDegrees(cartographic.longitude);
						var latitude = Cesium.Math.toDegrees(cartographic.latitude);

						var new_track = new Track(ftms_ui.track_manager.manual_track_counter++, latitude, longitude, 0, 0, 0, "unknown", "sea");
						ftms_ui.track_manager.setTrack(new_track);
						ftms_ui.event_manager.sendTrackUpdate(new_track, {}); //send to other clients
					}
				}
			});

			//Handle on-click entity selecting
			var self = this;
			var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
			handler.setInputAction(function(click) {
				var pickedObject = viewer.scene.pick(click.position);
				if(Cesium.defined(pickedObject)) {
					ftms_ui.track_manager.setSelectedTrack(ftms_ui.track_manager.getTrack(viewer.selectedEntity.id));
				} else {
					var previously_selected_track = ftms_ui.track_manager.getSelectedTrack();
					if(!previously_selected_track) return;
					ftms_ui.track_manager.setSelectedTrack(null);
					self.paintTrack(previously_selected_track);
				}
			}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
			
			ftms_ui.window_manager.appendToWindow('Map Module', display);

			ftms_ui.track_manager.setListener(this);
		},
		//Places/updates a track on viewer
		paintTrack: function(track) {
			var ent = viewer.entities.getById(track.id);

			//Decide which military symbol icon to use (uses milsymbol library)
			var icon_id = 10200000000000000000;
			switch(track.affiliation) {
				case "friendly": 	icon_id += 30000000000000000;
									break;
				case "hostile": 	icon_id += 60000000000000000;
									break;
				case "neutral": 	icon_id += 40000000000000000;
									break;
				case "unknown": 	icon_id += 10000000000000000;
									break;
			}
			switch(track.domain) {
				case "air": 		icon_id += 100000000000000;
									break;
				case "land": 		icon_id += 1000000000000000;
									break;
				case "sea": 		icon_id += 1500000000000000;
									break;
				case "subsurface": 	icon_id += 3500000000000000;
									break;
			}
			//icon_id = 10030500001300000000;
			//          100305    130000

			//Create milsymbol
			var color_mode = 'Light';
			if(ftms_ui.track_manager.getSelectedTrack() == track) {
				color_mode = 'Dark';
			}
			var icon = new ms.Symbol(icon_id, {size: icon_size, colorMode: color_mode}).asCanvas();

			//Create or update entity
			if(ent == undefined) {
				viewer.entities.add({
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
		},
		//Erases track from viewer
		eraseTrack: function(id) {
			var ent = viewer.entities.getById(id);
			viewer.entities.remove(ent);
		},
		//Updates the current state of all tracks
		update: function() {
			//Grab new track data
			var tracks = ftms_ui.track_manager.getTracks();
			
			//Paint tracks
			var self = this;
			tracks.forEach(function(value, key, map) {
				self.paintTrack(value);
			});
		},
		getViewer: function() {
			return viewer;
		}
	}
}());