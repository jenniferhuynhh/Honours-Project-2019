var MapModule = (function() {
	//Private
	var ftms_ui; //FTMS UI system this module is linked to

	var display;
	var viewer;
	var icon_size = 15; //Size of milsymbol symbols
	var current_highlighted = null;
	var offline_mode = true;
	var mode = "normal";

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
			var viewer_options = {
				animation: false,
				selectionIndicator: false,
				timeline: false,
				baseLayerPicker : false,
				geocoder : false
			}

			if(offline_mode) { //Use offline map tiles included with Cesium
				viewer_options.imageryProvider = Cesium.createTileMapServiceImageryProvider({
					url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
				});
			} else {
				Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNTNlZjU4NS05ZDZlLTRiMTUtOGVmYi1lYTIwNjk2ODcyN2IiLCJpZCI6MTA2ODQsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NTcxNTk1ODl9.pefjm_v8G065frNjyPdGYd9ggHaMdKBfukjjMbgTg6M';
			}

			viewer = new Cesium.Viewer(display, viewer_options);
			viewer.scene.mode = Cesium.SceneMode.SCENE2D;

			//Remove entity focus-locking upon double click
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
			var initialPosition = new Cesium.Cartesian3.fromDegrees(139.430433, -27.563744, 6400000);
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
			var map_buttons_div = document.createElement("div");

			//Manual track handling
			var manual_track_button = document.createElement("button");
			manual_track_button.innerHTML = "Manual";
			manual_track_button.classList.add("manual-track-button", "custom-cesium-button", "custom-cesium-toolbar-button");
			manual_track_button.addEventListener("click", function() { //Toggles manual mode on/off
				if(mode == "manual") mode = "normal";
				else mode = "manual";
				this.classList.toggle("active");
			});
			map_buttons_div.appendChild(manual_track_button);

			//Ownship focus
			var ownship_button = document.createElement("button");
			ownship_button.innerHTML = "Ownship";
			ownship_button.classList.add("ownship-button", "custom-cesium-button", "custom-cesium-toolbar-button");
			ownship_button.addEventListener("click", function() { //Toggles ownship mode on/off
				if(mode == "ownship") mode = "normal";
				else mode = "ownship";
				this.classList.toggle("active");
			})
			map_buttons_div.appendChild(ownship_button);
			
			display.appendChild(map_buttons_div);

			//Handle on-click track icon selecting
			var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
			handler.setInputAction(click => {
				if(mode == "manual") {
					if(current_highlighted) viewer.selectedEntity = viewer.entities.getById(current_highlighted.id); //prevent current selected track's infobox disappearing

					var ellipsoid = viewer.scene.globe.ellipsoid;
					var cartesian = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(click.position.x, click.position.y), ellipsoid);
					if(cartesian) {
						var cartographic = ellipsoid.cartesianToCartographic(cartesian);
						var lat = Cesium.Math.toDegrees(cartographic.latitude);
						var long = Cesium.Math.toDegrees(cartographic.longitude);

						//Asks server for next manual track ID to be used; makes new manual track upon reply
						ftms_ui.track_manager.getManualTrackId(function(id) {
							var new_track = {
								trackId: id,
								latitude: lat,
								longitude: long,
								altitude: 0,
								speed: 0,
								course: 0,
								manual: true
							};
							ftms_ui.track_manager.createTrack(new_track);
							ftms_ui.event_manager.sendTrackUpdate(ftms_ui.track_manager.getTrack(new_track.trackId), {}); //send to other clients
						});
					}
				} else if(mode == "normal") {
					var pickedObject = viewer.scene.pick(click.position);
					if(Cesium.defined(pickedObject)) { //If clicked on a track icon
						var clicked_track = ftms_ui.track_manager.getTrack(viewer.selectedEntity.id);
						clicked_track.selected(); //Select/unselect that icon's track
					} else { //If clicked on empty space on the map
						if(current_highlighted) current_highlighted.selected(); //Unselect current selected track
					}
				}
			}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

			/*var pickedObject = viewer.scene.pick(click.position);
			if(Cesium.defined(pickedObject)) { //If clicked on entity
				ftms_ui.track_manager.setSelectedTrack(ftms_ui.track_manager.getTrack(viewer.selectedEntity.id));
			} else { //If clicked on empty space
				var previously_selected_track = ftms_ui.track_manager.getSelectedTrack();
				if(!previously_selected_track) return;
				ftms_ui.track_manager.setSelectedTrack(null);
				this.paintTrack(previously_selected_track);
			}*/

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

				//When track is about to be deleted, remove its icon from viewer
				track.addEventListener("delete", () => {
					this.eraseTrack(track);
				})
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

		makeIcon: function(track) {
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
									if(track.manual) icon_id += 1400000000;
									break;
				case "land": 		icon_id += 1000000000000000;
									if(track.manual) icon_id += 500002400000000;
									break;
				case "sea": 		icon_id += 1500000000000000;
									if(track.manual) icon_id += 1500001700000000;
									break;
				case "subsurface": 	icon_id += 3500000000000000;
									if(track.manual) icon_id += 1600000000;
									break;
			}

			var color_mode = "Light";
			if(current_highlighted == track) color_mode = "Dark";

			return new ms.Symbol(icon_id, {size: icon_size, colorMode: color_mode}).asCanvas();
		},

		//Erases track from viewer
		eraseTrack: function(track) {
			var ent = viewer.entities.getById(track.trackId);
			viewer.entities.remove(ent);
		},

		//Updates the appearance of all tracks
		updateIcons: function() {
			var tracks = ftms_ui.track_manager.getTracks();

			tracks.forEach((val, key) => {
				var ent = viewer.entities.getById(key);
				ent.billboard.image = this.makeIcon(val);
			});
		},

		getViewer: function() {
			return viewer;
		},

		setIconSize: function(num) {
			icon_size = num;
			this.updateIcons();
		}
	}
}());