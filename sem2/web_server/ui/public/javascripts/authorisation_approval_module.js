var AuthorisationApprovalModule = (function() {
	//Private
	var ftms_ui;
	var display;
	var requests = new Map();

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
			requests_table.requestId = data.requestId;

			var row = document.createElement("tr");

			var cell1 = document.createElement("td");
			var cell2 = document.createElement("td");
			var tick_cell = document.createElement("td");
			var cross_cell = document.createElement("td");

			cell1.setAttribute("class", "cell1");
			cell1.appendChild(document.createTextNode("16:04:05"));
			cell1.appendChild(document.createElement("br"));
			cell1.appendChild(document.createTextNode("Jennifer Huynh"));		

			cell2.setAttribute("class", "cell1");
			for (var key in data) {
			    if (data.hasOwnProperty(key)) {
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
				display.removeChild(requests_table);
				ftms_ui.event_manager.sendRequestStatus({
					requestId: requests_table.requestId,
					status: "Approved"
				});
			});
			
			cross_cell.setAttribute("class", "cross_cell");
			cross_cell.appendChild(document.createTextNode("✕"));
			cross_cell.addEventListener("click", function(){
				display.removeChild(requests_table);
				ftms_ui.event_manager.sendRequestStatus({
					requestId: requests_table.requestId,
					status: "Denied"
				});
			});

			row.appendChild(cell1);
			row.appendChild(cell2);
			row.appendChild(tick_cell);
			row.appendChild(cross_cell);

			requests_table.appendChild(row);

			display.appendChild(requests_table);
		},

		receiveConfirmation: function(data) {
			data.uiElement = this.generateResponseNotification(data);
			requests.set(data.requestId, data);	
		},

		generateResponseNotification: function(data) {
			var requests_table = document.createElement("table");
			requests_table.setAttribute("class", "requests_table");

			var row = document.createElement("tr");

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

			row.appendChild(cell1);
			row.appendChild(cell2);
			row.appendChild(status_cell);

			requests_table.appendChild(row);

			display.appendChild(requests_table);

			return requests_table;
		},

		receiveRequestStatus: function(data) {
			var request = requests.get(data.requestId);
			console.log(request);
			request.status = data.status;
			request.uiElement.rows[0].cells[2].innerHTML = request.status;
		}
	}
}());