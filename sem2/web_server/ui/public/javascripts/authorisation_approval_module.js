var AuthorisationApprovalModule = (function() {
	//Private
	var ftms_ui;
	var display;
	var requests;

	//Public 
	return {
		initialise: function(ftms) {
			//link FTMS UI system
			ftms_ui = ftms;

			//create div for the module
			display = document.createElement("div");
			display.setAttribute('class', 'center_align');

			requests = new Map();

			//append display to window
			ftms_ui.window_manager.appendToWindow('Authorisation Approval', display);

			ftms_ui.event_manager.getAllRequests();
		},

		receiveRequest: function(data) {
			this.generateRequestNotification(data);
		},

		receiveRequests: function(firing_requests) {
			firing_requests.forEach(data=>{
				this.receiveRequest(data);
			});
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
			cell1.appendChild(document.createTextNode(new Date(data.timestamp).toLocaleTimeString('en-US')));
			cell1.appendChild(document.createElement("br"));
			cell1.appendChild(document.createTextNode(data.username));		

			cell2.setAttribute("class", "cell1");
			cell2.appendChild(document.createTextNode("Track Id: " + data.trackId));
			cell2.appendChild(document.createElement("br"));
			var message = "Weapon Ids: ";
        	for (var i = 0; i < data.weaponIds.length; i++){
        		message += data.weaponIds[i];
        		if (i+1 != data.weaponIds.length){
        			message += ", ";
        		}			        		
        	}
        	cell2.appendChild(document.createTextNode(message));
			
			tick_cell.setAttribute("class", "tick_cell");
			tick_cell.appendChild(document.createTextNode("✓"));
			tick_cell.addEventListener("click", function(){
				display.removeChild(requests_table);
				ftms_ui.event_manager.sendRequestStatus({
					requestId: requests_table.requestId,
					status: "approved"
				});
			});
			
			cross_cell.setAttribute("class", "cross_cell");
			cross_cell.appendChild(document.createTextNode("✕"));
			cross_cell.addEventListener("click", function(){
				display.removeChild(requests_table);
				ftms_ui.event_manager.sendRequestStatus({
					requestId: requests_table.requestId,
					status: "denied"
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
			data.resElement = this.generateResponseNotification(data);
			requests.set(data.requestId, data);	
		},

		receiveConfirmations: function(confirmations) {
			confirmations.forEach(data=>{
				this.receiveConfirmation(data);
			});
		},

		generateResponseNotification: function(data) {
			var response_table = document.createElement("table");
			response_table.setAttribute("class", "response_table");
			response_table.addEventListener("click", function(){
				var response = requests.get(data.requestId);
				if(response.status == "approved"){
					ftms_ui.weapon_firing_module.disableButtons();
					ftms_ui.weapon_firing_module.unselectButtons();
					ftms_ui.weapon_firing_module.requestId = data.requestId;
					for(var i = 0; i < data.weaponIds.length; i++){
						ftms_ui.weapon_firing_module.weapons_buttons[data.weaponIds[i]-1].disabled = false;
					}
					var stack = ftms_ui.window_manager.getDisplay().root.getItemsById('FOStack')[0];
					var tab = ftms_ui.window_manager.getDisplay().root.getItemsById('weaponFiring')[0];
					stack.setActiveContentItem(tab);
				} else if(response.status == "denied"){
					ftms_ui.event_manager.deleteResponse(data.requestId);
				}
			});

			var row = document.createElement("tr");

			var cell1 = document.createElement("td");
			var cell2 = document.createElement("td");
			var status_cell = document.createElement("td");

			cell1.setAttribute("class", "cell1");
			cell1.appendChild(document.createTextNode(new Date(data.timestamp).toLocaleTimeString('en-US')));
			cell1.appendChild(document.createElement("br"));
			cell1.appendChild(document.createTextNode(data.username));	
		
			cell2.setAttribute("class", "cell1");
	        cell2.appendChild(document.createTextNode("Track Id: " + data.trackId));
	        cell2.appendChild(document.createElement("br"));

        	var message = "Weapon Ids: ";
        	for (var i = 0; i < data.weaponIds.length; i++){
        		message += data.weaponIds[i];
        		if (i+1 != data.weaponIds.length){
        			message += ", ";
        		}			        		
        	}
	        cell2.appendChild(document.createTextNode(message));
			
			status_cell.setAttribute("class", "status_cell");
			status_cell.appendChild(document.createTextNode(data.status[0].toUpperCase() + data.status.slice(1)));

			row.appendChild(cell1);
			row.appendChild(cell2);
			row.appendChild(status_cell);

			response_table.appendChild(row);

			display.appendChild(response_table);

			return response_table;
		},

		receiveRequestStatus: function(data) {
			var request = requests.get(data.requestId);
			console.log(data.requestId);
			request.status = data.status;
			request.resElement.rows[0].cells[2].innerHTML = data.status[0].toUpperCase() + data.status.slice(1);
		},

		deleteResponse: function(requestId) {
			var response = requests.get(requestId);
			display.removeChild(response.resElement);
		}
	}
}());