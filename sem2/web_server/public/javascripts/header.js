var Header = (function() {

	//private
	var ftms_ui;
	var display;
	var header_table;
	var header_elements;

	//public
	return {
		initialise: function(ftms){
			//link FTMS UI system
			ftms_ui = ftms;

			header_table = document.createElement("table");
			header_table.setAttribute("class", "header_table");

			header_elements = ["Course: ", "Speed: ", "Long: ", "Lat: ", "Date: ", "Time: ", "Role: ", "Logout"];
			var header_bar = document.createElement("tr");
			for(var i = 0; i < header_elements.length; i++) {
				var th = document.createElement("th");
				th.appendChild(document.createTextNode(header_elements[i]));
				header_bar.appendChild(th);
			}
			header_table.appendChild(header_bar);
			document.getElementById("header").appendChild(header_table);
		}
	}
}());
