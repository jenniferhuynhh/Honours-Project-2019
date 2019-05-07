function Renderer() {
	this.ftms_ui; //FTMS UI system this module is linked to

	//Initialises renderer
	this.initialise = function(ftms_ui) {
		log("Renderer initialising...");

		//Link the simulator
		this.ftms_ui = ftms_ui;

		log("Renderer initialised");
	};

	//Places/updates a track on the map
	this.paintTrack = function(track) {
		var viewer = this.ftms_ui.map_module.viewer;
		var ent = viewer.entities.getById(track.id);

		if(ent == undefined) {
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
		} else {
			ent.position = Cesium.Cartesian3.fromDegrees(track.longitude, track.latitude, 0);
			ent.description = `Affiliation: ${track.affiliation} <br> Longitude: ${track.longitude} <br> Latitude: ${track.latitude}`;
		}
	}

	//Renders the current state of the simulator
	this.render = function() {
		//Grab new track data
		var tracks = this.ftms_ui.simulator.tracks;
		
		//Paint tracks if not out of bounds
		for(var i = 0; i < tracks.length; i++) {
			this.paintTrack(tracks[i]);
		}
	};
}