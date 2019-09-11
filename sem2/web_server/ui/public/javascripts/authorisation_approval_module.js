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

			//append display to window
			ftms_ui.window_manager.appendToWindow('Authorisation Approval Module', display);
		},

		receiveRequests: function(data) {
			this.generateRequestNotification(data);
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
			//cell1.appendChild(document.createElement("br"));
		

			cell2.setAttribute("class", "cell1");
			for (var key in data) {
			    if (data.hasOwnProperty(key)) {
			        console.log(data[key]);
			        if (key == "trackId"){
			        	cell2.appendChild(document.createTextNode("Track Id: " + data[key]));
			        	cell2.appendChild(document.createElement("br"));
			        }
			        else if (key == "weaponIds"){
			        	var message = "Weapon Ids: ";
			        	for (var i = 0; i < data[key].length; i++){
			        		message += data[key][i];
			        		if (i+1 != data[key].length){
			        			message += ", ";
			        		}			        		
			        	}
			        	cell2.appendChild(document.createTextNode(message));
			        }
			    }
			}
			
			tick_cell.setAttribute("class", "tick_cell");
			tick_cell.appendChild(document.createTextNode("✓"));
			tick_cell.addEventListener("click", function(){

			});
			
			cross_cell.setAttribute("class", "cross_cell");
			cross_cell.appendChild(document.createTextNode("✕"));

			requests_table.appendChild(cell1);
			requests_table.appendChild(cell2);
			requests_table.appendChild(tick_cell);
			requests_table.appendChild(cross_cell);

			display.appendChild(requests_table);
		},

		receiveConfirmation: function(data) {
			this.generateResponseNotification(data);
		},

		generateResponseNotification: function(data) {
			var requests_table = document.createElement("table");
			requests_table.setAttribute("class", "requests_table");

			var cell1 = document.createElement("td");
			var cell2 = document.createElement("td");
			var status_cell = document.createElement("td");

			cell1.setAttribute("class", "cell1");
			cell1.appendChild(document.createTextNode("16:04:05"));
			cell1.appendChild(document.createElement("br"));
			cell1.appendChild(document.createTextNode("Jennifer Huynh"));
		
			cell2.setAttribute("class", "cell1");
			for (var key in data) {
			    if (data.hasOwnProperty(key)) {
			        console.log(data[key]);
			        if (key == "trackId"){
			        	cell2.appendChild(document.createTextNode("Track Id: " + data[key]));
			        	cell2.appendChild(document.createElement("br"));
			        }
			        else if (key == "weaponIds"){
			        	var message = "Weapon Ids: ";
			        	for (var i = 0; i < data[key].length; i++){
			        		message += data[key][i];
			        		if (i+1 != data[key].length){
			        			message += ", ";
			        		}			        		
			        	}
			        	cell2.appendChild(document.createTextNode(message));
			        }
			    }
			}
			
			status_cell.setAttribute("class", "status_cell");
			status_cell.appendChild(document.createTextNode(data.status));

			requests_table.appendChild(cell1);
			requests_table.appendChild(cell2);
			requests_table.appendChild(status_cell);

			display.appendChild(requests_table);
		}
	}
}());