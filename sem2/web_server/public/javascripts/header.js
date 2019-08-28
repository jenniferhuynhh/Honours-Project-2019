var Header = (function() {

	//private
	var ftms_ui;
	var display;
	var header_table;
	var header_elements;
	var date,time;

	//public
	return {
		initialise: function(ftms){
			//link FTMS UI system
			ftms_ui = ftms;

			header_table = document.createElement("table");
			header_table.setAttribute("class", "header_table");

			var today = new Date();
			date = today.getDate() + '/' + (today.getMonth()+1) + '/' + today.getFullYear();
			time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();

			header_elements = ["Course: ", "Speed: ", "Long: ", "Lat: ", date, time, "Role: ", "Logout"];
			header_ids = ["header_course", "header_speed", "header_long", "header_lat", "header_date", "header_time", "header_role", "header_logout"];
			var header_bar = document.createElement("tr");
			for(var i = 0; i < header_elements.length; i++) {
				var th = document.createElement("th");
				th.setAttribute("id", header_ids[i]);
				th.appendChild(document.createTextNode(header_elements[i]));
				header_bar.appendChild(th);
			}
			header_table.appendChild(header_bar);
			document.getElementById("header").appendChild(header_table);
			this.updateHeader();
		},

		//updates the header every millisecond
		updateHeader: function(){
			var self = this;

			setTimeout(function(){
				var t = new Date();
				document.getElementById("header_date").innerHTML = t.getDate() + '/' + (t.getMonth()+1) + '/' + t.getFullYear();
				document.getElementById("header_time").innerHTML = t.getHours() + ':' + t.getMinutes() + ':' + t.getSeconds();
				var ownship = ftms_ui.simulator.getTrack(123);
				document.getElementById("header_course").innerHTML = "Course: " + ownship.course.toFixed(3) + "°";
				document.getElementById("header_speed").innerHTML = "Course: " + ownship.speed.toFixed(3) + " knots";
				document.getElementById("header_long").innerHTML = "Course: " + ownship.longitude.toFixed(8);
				document.getElementById("header_lat").innerHTML = "Course: " + ownship.latitude.toFixed(8);
				self.updateHeader();
			}, 1000);
		}
	}
}());
