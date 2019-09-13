var Header = (function() {
	//Private
	var ftms_ui;
	var display;
	var header_cells = {};

	//Public
	return {
		initialise: function(ftms) {
			//link FTMS UI system
			ftms_ui = ftms;

			display = document.createElement("table");
			display.setAttribute("class", "header_table");

			//Create header table
			var header_cells_names = ["course", "speed", "lat", "long", "date", "time", "role", "logout"];
			var header_row = document.createElement("tr");
			for(var i = 0; i < header_cells_names.length; i++) {
				var th = document.createElement("th");
				header_row.appendChild(th);
				header_cells[header_cells_names[i]] = th; //Make cells accessible later
			}

			//Get user's role
			var role;
			switch(getCookie("role")) {
				case "ts": role = "Track Supervisor";
						   break;
				case "wo": role = "Warfare Officer";
						   break;
				case "fs": role = "Firing Officer";
						   break;
			}
			header_cells["role"].innerHTML = "Role: " + role;

			//Make logout link
			var logout_link = document.createElement("a");
			logout_link.setAttribute("href", "logout/");
			logout_link.innerHTML = "Logout";
			header_cells["logout"].appendChild(logout_link);
			display.appendChild(header_row);

			ftms_ui.track_manager.setListener(this);
			document.getElementById("header").appendChild(display);

			this.update();
			this.updateLoop();
		},

		//Updates the header
		update: function() {
			var t = new Date();
			header_cells["date"].innerHTML = t.toLocaleDateString('en-AU');
			header_cells["time"].innerHTML = t.toLocaleTimeString('en-US');
			var ownship = ftms_ui.track_manager.getTrack(6291459); //will need to change eventually
			if(ownship) {
				header_cells["course"].innerHTML = "Course: " + ownship.course.toFixed(3) + "°";
				header_cells["speed"].innerHTML = "Speed: " + ownship.speed.toFixed(3) + " knots";
				header_cells["lat"].innerHTML = "Lat: " + ownship.latitude.toFixed(8);
				header_cells["long"].innerHTML = "Long: " + ownship.longitude.toFixed(8);
			} else {
				header_cells["course"].innerHTML = "Course:";
				header_cells["speed"].innerHTML = "Speed:";
				header_cells["lat"].innerHTML = "Lat:";
				header_cells["long"].innerHTML = "Long:";
			}
		},

		//Updates the header every second
		updateLoop: function() {
			var self = this;
			setTimeout(function() {
				self.update()
				self.updateLoop();
			}, 1000);
		}
	}
}());
