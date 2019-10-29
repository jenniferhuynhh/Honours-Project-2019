var Header = (function() {
	//Private
	var ftms_ui;
	var display;
	var header_cells;
	var ownship;

	//Public
	return {
		initialise: function(ftms) {
			//link FTMS UI system
			ftms_ui = ftms;

			display = document.createElement("table");
			display.classList.add("header_table");

			//Create header table
			header_cells = {};
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
				case "fo": role = "Firing Officer";
						   break;
			}
			header_cells["role"].innerHTML = "Role: " + role;

			//Make logout link
			var logout_link = document.createElement("a");
			logout_link.href = "logout/";
			logout_link.innerHTML = "Logout";
			header_cells["logout"].appendChild(logout_link);
			display.appendChild(header_row);

			document.getElementById("header").appendChild(display);

			//If ownship id is changed, detach old ownship and look for new one
			ftms_ui.settings_manager.addEventListener("ownship_id", () => {if(ownship) this.newOwnship()});

			this.updateTimeDate();
			this.newOwnship();
		},

		//Updates the header
		update: function() {
			try {
				header_cells["course"].innerHTML = "Course: " + ownship.course.toFixed(3) + "°";
				header_cells["speed"].innerHTML = "Speed: " + ownship.speed.toFixed(3) + " knots";
				header_cells["lat"].innerHTML = "Lat: " + ownship.latitude.toFixed(8);
				header_cells["long"].innerHTML = "Long: " + ownship.longitude.toFixed(8);
			} catch(err) {}
		},

		//Looks for ownship and attaches relevant listeners
		lookForOwnship() {
			ownship = ftms_ui.track_manager.getTrack(ftms_ui.settings_manager.getSetting("ownship_id"));
			if(ownship) {
				this.update();
				ownship.addEventListener("update", () => this.update());
				ownship.addEventListener("delete", () => this.clear());
			} else { //If not found, keep looking
				setTimeout(() => this.lookForOwnship(), 200);  //Run every 0.5 seconds
			}
		},

		//Clears ownship and track fields
		clear: function() {
			if(ownship) {
				ownship.removeEventListener("update", this.update);
				ownship.removeEventListener("delete", this.clear);
				ownship = null;
			}
			header_cells["course"].innerHTML = "Course:";
			header_cells["speed"].innerHTML = "Speed:";
			header_cells["lat"].innerHTML = "Lat:";
			header_cells["long"].innerHTML = "Long:";
		},

		//Prepares for a new ownship
		newOwnship: function() {
			this.clear();
			this.lookForOwnship();
		},

		//Updates time and date
		updateTimeDate: function() {
			var t = new Date();
			header_cells["date"].innerHTML = t.toLocaleDateString('en-AU');
			header_cells["time"].innerHTML = t.toLocaleTimeString('en-US');
			setTimeout(() => this.updateTimeDate(), 1000); //Run every 1 second
		}
	}
}());