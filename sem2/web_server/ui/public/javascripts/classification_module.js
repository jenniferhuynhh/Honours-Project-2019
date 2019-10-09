var ClassificationModule = (function() {
	//Private
	var ftms_ui;
	var display;
	var types_menu, domain_buttons, affiliation_buttons;

	var track_types;
	var track_domains, track_affiliations;

	var selected_track;

	//Public
	return {
		//Declares track types/domains/affilitations and generates display elements
		initialise: function(ftms) {
			//links FTMS UI system
			ftms_ui = ftms;

			//Track types
			track_types = {
				land: ['Tank', 'Humvee', 'Desert patrol vehicle'],
				sea: ['Missile boat', 'Naval ship', 'Patrol boat' ],
				air: ['Jet', 'Helicopter', 'Military aircraft'],
				subsurface: ['Submarine', 'Torpedo']
			}

			//Track domains
			track_domains = ['Land', 'Sea', 'Subsurface', 'Air'];

			//Track affiliations
			track_affiliations = ['Friendly', 'Neutral', 'Hostile', 'Unknown'];

			//DISPLAY SETUP
			//Create div for elements to sit in
			display = document.createElement("div");

			//Track type dropdown menu div
			var types_div = document.createElement('div');
			types_div.classList.add('center_align');

			var types_div_contents = document.createElement('div');
			types_div_contents.classList.add('dropdown_container');

			types_menu = document.createElement('select');
			types_menu.classList.add('type_dropdown_menu');

			var self = this;
			types_menu.addEventListener('change', function(){
				self.updateTrack('type', this.value.toLowerCase());
			});
			types_div_contents.appendChild(document.createTextNode('Type: '));
			types_div_contents.appendChild(types_menu);
			types_div.appendChild(types_div_contents);

			//Track domain div
			var domain_div = document.createElement('div');
			domain_div.classList.add('center_align');
			//domain_div.classList.add('classification_buttons_container');
			
			domain_buttons = [];
			for (var i = 0; i < track_domains.length; i++) {
				domain_buttons.push(this.generateButton(track_domains[i], 'domain'));
				domain_div.appendChild(domain_buttons[i]);
			}

			//Track affiliation div
			var affiliation_div = document.createElement('div');
			affiliation_div.classList.add('center_align');
			//affiliation_div.classList.add('class', 'classification_buttons_container');

			affiliation_buttons = [];
			for (var i = 0; i < track_affiliations.length; i++) {
				affiliation_buttons.push(this.generateButton(track_affiliations[i], 'affiliation'));
				affiliation_div.appendChild(affiliation_buttons[i]);
			}

			//append the divs to display
			display.appendChild(types_div);
			display.appendChild(domain_div);
			display.appendChild(affiliation_div);

			ftms_ui.track_manager.addEventListener("selected", track => {
				if(selected_track) selected_track.removeEventListener("update", this.update);
				selected_track = track;
				selected_track.addEventListener("update", this.update);
				this.update();
			});

			ftms_ui.track_manager.addEventListener("unselected", () => {
				selected_track.removeEventListener("update", this.update);
				selected_track = null;
				this.clearFields();
			});

			ftms_ui.window_manager.appendToWindow('Track Classification Module', display);
		},

		//Generates a button with a value and an onclick function that changes the property of a track
		generateButton: function(s, property) {
			var button = document.createElement('input');
			button.classList.add('unhighlighted_classification_buttons');
			button.type = 'button';
			button.value = s;
			button.addEventListener('click', () => {
				this.updateTrack(property, s.toLowerCase());
			});
			return button;
		},

		//Updates a tracks data when needed (dropdown change/button press)
		updateTrack: function(property, value) {
			//If nothing is selected
			if(!selected_track) {
				this.clearFields(); 
				return;
			}

			var update_data = {};
			update_data[property] = value;

			//Update locally
			selected_track.updateData(update_data);

			//Send track update to track server
			ftms_ui.event_manager.sendTrackUpdate(selected_track, update_data);
		},
		
		//Updates the dropdown menu and buttons to reflect track properties
		update: function() {
			//Update dropdown menu
			var selected_array = track_types[selected_track.domain.toLowerCase()];

			//Clear existing options
			while(types_menu.options.length > 0) types_menu.remove(0);

			//Add topmost option
			var empty_option = document.createElement('option');
			types_menu.appendChild(empty_option);

			//Add relevant options
			for(var i = 0; i < selected_array.length; i++) {
				var option = document.createElement('option');
				option.innerHTML = selected_array[i];
				if(selected_track.type == option.innerHTML.toLowerCase()) {
					option.selected = true;
				}
				types_menu.appendChild(option);
			}

			//Update domain buttons
			for(var i = 0; i < domain_buttons.length; i++) {
				if(domain_buttons[i].value.toLowerCase() == selected_track.domain) {
					domain_buttons[i].setAttribute('class', 'highlighted_classification__buttons');
				}
				else{
					domain_buttons[i].setAttribute('class', 'unhighlighted_classification_buttons');
				}
			}

			//Update affiliation buttons
			for(var i = 0; i < affiliation_buttons.length; i++) {
				if(affiliation_buttons[i].value.toLowerCase() == selected_track.affiliation) {
					affiliation_buttons[i].setAttribute('class', 'highlighted_classification__buttons');
				} else {
					affiliation_buttons[i].setAttribute('class', 'unhighlighted_classification_buttons');
				}
			}
		},

		//Clears the dropdown menu and deselects domain and affiliation buttons
		clearFields: function() {
			while(types_menu.options.length > 0) types_menu.remove(0);
			for(var i = 0; i < domain_buttons.length; i++) {
				domain_buttons[i].setAttribute('class', 'unhighlighted_classification_buttons');
			}
			for(var i = 0; i < affiliation_buttons.length; i++) {
				affiliation_buttons[i].setAttribute('class', 'unhighlighted_classification_buttons');
			}
		}		
	}
}());