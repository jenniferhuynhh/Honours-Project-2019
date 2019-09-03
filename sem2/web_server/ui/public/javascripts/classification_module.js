var ClassificationModule = (function() {
	//Private
	var ftms_ui;
	var display;
	var div1, div2, div3;
	var div1_menu;
	var div2_buttons, div3_buttons;

	var land_types, sea_types, air_types, subsurface_types;
	var track_domains, track_affiliations;

	//Public
	return {
		//Declares track types/domains/affilitations and generates display elements
		initialise: function(ftms) {
			//links FTMS UI system
			ftms_ui = ftms;

			//Create div for elements to sit in
			display = document.createElement("div");

			//Track types
			land_types = ['Tank', 'Humvee', 'Desert patrol vehicle'];
			sea_types = ['Missile boat', 'Naval ship', 'Patrol boat' ];
			air_types = ['Jet', 'Helicopter', 'Military aircraft'];
			subsurface_types = ['Submarine', 'Torpedo'];

			//Track domains
			track_domains = ['Land', 'Sea', 'Subsurface', 'Air'];

			//Track affiliations
			track_affiliations = ['Friendly', 'Neutral', 'Hostile', 'Unknown'];

			//Track type dropdown menu div
			div1 = document.createElement('div');
			div1.setAttribute('class', 'center_align');

			var div1_contents = document.createElement('div');
			div1_contents.setAttribute('class', 'dropdown_container');

			var type_text = document.createTextNode('Type: ');

			div1_menu = document.createElement('select');
			div1_menu.setAttribute('class', 'type_dropdown_menu');

			var self = this;
			div1_menu.addEventListener('change', function(){
				self.updateTrack('type', this.value.toLowerCase());
			});
			div1_contents.appendChild(type_text);
			div1_contents.appendChild(div1_menu);
			div1.appendChild(div1_contents);

			//Track domain div
			div2 = document.createElement('div');
			div2.setAttribute('class', 'classification_buttons_container');
			div2.setAttribute('class', 'center_align');
			
			div2_buttons = [];
			for (var i = 0; i < track_domains.length; i++) {
				div2_buttons.push(this.generateButton(track_domains[i], 'domain'));
				div2.appendChild(div2_buttons[i]);
			}

			//Track affiliation div
			div3 = document.createElement('div');
			div3.setAttribute('class', 'classification_buttons_container');
			div3.setAttribute('class', 'center_align');

			div3_buttons = [];
			for (var i = 0; i < track_affiliations.length; i++) {
				div3_buttons.push(this.generateButton(track_affiliations[i], 'affiliation'));
				div3.appendChild(div3_buttons[i]);
			}

			//append the divs to display
			display.appendChild(div1);
			display.appendChild(div2);
			display.appendChild(div3);
			ftms_ui.window_manager.appendToWindow('Track Classification Module', display);
		},

		//Generates a button with a value and an onclick function that changes the property of a track
		generateButton: function(s, property) {
			var button = document.createElement('input');
			button.setAttribute('class', 'unhighlighted_classification_buttons');
			button.setAttribute('type', 'button');
			button.setAttribute('value', s);
			var self = this;
			button.addEventListener('click', function() {
				self.updateTrack(property, s.toLowerCase());
			});

			return button;
		},

		//Updates a tracks data when needed (dropdown change/button press)
		updateTrack: function(property, value) {
			var track_id = ftms_ui.track_table_module.selected_track_id;
			//If nothing is selected
			if(track_id < 0) {
				this.clearFields(); 
				return;
			} 

			var track = ftms_ui.track_manager.getTrack(track_id);
			if(property == 'affiliation') {
				track.affiliation = value;
			} else if(property == 'domain') {
				track.domain = value;
			} else if(property == 'type') {
				track.type = value; 
			}
			this.updateDisplay();
		},
		
		//Updates the dropdown menu and buttons to reflect track properties
		updateDisplay: function() {
			var track_id = ftms_ui.track_table_module.selected_track_id;
			//If nothing is selected
			if(track_id < 0) {
				this.clearFields(); 
				return;
			} 

			var track = ftms_ui.track_manager.getTrack(track_id);

			//Update dropdown menu
			var selected_array;
			if(track.domain == 'land') {
				selected_array = land_types;
			} else if(track.domain == 'air') {
				selected_array = air_types;
			} else if(track.domain == 'sea') {
				selected_array = sea_types;
			} else if(track.domain == 'subsurface') {
				selected_array = subsurface_types;
			}

			//Clear existing options
			div1_menu.innerHTML = "";

			//Add topmost option
			var empty_option = document.createElement('option');
			div1_menu.appendChild(empty_option);

			//Add relevant options
			for(var i = 0; i < selected_array.length; i++) {
				var option = document.createElement('option');
				option.innerHTML = selected_array[i];
				if(track.type == option.innerHTML.toLowerCase()) {
					option.selected = true;
				}
				div1_menu.appendChild(option);
			}

			//Update domain buttons
			for(var i = 0; i < div2_buttons.length; i++) {
				if(div2_buttons[i].value.toLowerCase() == track.domain) {
					div2_buttons[i].setAttribute('class', 'highlighted_classification__buttons');
				}
				else{
					div2_buttons[i].setAttribute('class', 'unhighlighted_classification_buttons');
				}
			}

			//Update affiliation buttons
			for(var i = 0; i < div3_buttons.length; i++) {
				if(div3_buttons[i].value.toLowerCase() == track.affiliation) {
					div3_buttons[i].setAttribute('class', 'highlighted_classification__buttons');
				} else {
					div3_buttons[i].setAttribute('class', 'unhighlighted_classification_buttons');
				}
			}

			ftms_ui.track_table_module.updateTrackTable();
			ftms_ui.map_module.render();
		},

		//Clears the dropdown menu and deselects domain and affiliation buttons
		clearFields: function() {
			div1_menu.innerHTML = "";
			for(var i = 0; i < div2_buttons.length; i++) {
				div2_buttons[i].setAttribute('class', 'unhighlighted_classification_buttons');
			}
			for(var i = 0; i < div3_buttons.length; i++) {
				div3_buttons[i].setAttribute('class', 'unhighlighted_classification_buttons');
			}
		}		
	}
}());