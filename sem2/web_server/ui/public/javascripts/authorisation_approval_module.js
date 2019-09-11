var AuthorisationApprovalModule = (function() {
	//Private
	var ftms_ui;
	var display;

	//Public 
	return {
		initialise: function(ftms) {
			//link FTMS UI system
			ftms_ui = ftms;

			//create div for the module
			display = document.createElement("div");
			display.setAttribute('class', 'center_align');

			this.generateRequestNotification({
				trackId: 123,
				weaponIds: [1,2]
			});
			
			//append display to window
			ftms_ui.window_manager.appendToWindow('Authorisation Approval Module', display);
		},

		receiveRequests: function(data) {
			//
		},

		generateRequestNotification: function(data) {
			var requests_table = document.createElement("table");
			requests_table.setAttribute("class", "requests_table");

			var cell1 = document.createElement("td");
			var cell2 = document.createElement("td");
			var tick_cell = document.createElement("td");
			var cross_cell = document.createElement("td");

			cell1.setAttribute("class", "cell1");
			cell1.appendChild(document.createTextNode("16:04:05"));
			cell1.appendChild(document.createElement("br"));
			cell1.appendChild(document.createTextNode("Jennifer Huynh"));
			cell1.appendChild(document.createElement("br"));
			for (var key in data) {
			    if (data.hasOwnProperty(key)) {
			        console.log(data[key]);
			        if (key == "trackId"){
			        	cell1.appendChild(document.createTextNode("Track Id: " + data[key]));
			        	cell1.appendChild(document.createElement("br"));
			        }
			        else if (key == "weaponIds"){
			        	var message = "Weapon Ids: ";
			        	for (var i = 0; i < data[key].length; i++){
			        		message += data[key][i];
			        		if (i+1 != data[key].length){
			        			message += ", ";
			        		}			        		
			        	}
			        	cell1.appendChild(document.createTextNode(message));
			        }
			    }
			}

			
			tick_cell.setAttribute("class", "tick_cell");
			tick_cell.appendChild(document.createTextNode("✓"));
			
			cross_cell.setAttribute("class", "cross_cell");
			cross_cell.appendChild(document.createTextNode("✕"));

			requests_table.appendChild(cell1);
			requests_table.appendChild(cell2);
			requests_table.appendChild(tick_cell);
			requests_table.appendChild(cross_cell);

			display.appendChild(requests_table);
		}
	}
}());