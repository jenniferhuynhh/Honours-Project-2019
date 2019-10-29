var WeaponAuthorisationModule = (function() {
	//Private
	var ftms_ui;
	var display;
	var div1, div2;
	var weapons_buttons;
	var authorise_button;

	//Public 
	return {
		initialise: function(ftms) {
			//link FTMS UI system
			ftms_ui = ftms;

			//create div for the module
			display = document.createElement("div");
			display.setAttribute('class', 'center_align');

			weapons_buttons = [];
			var weapons_button_names = ['1', '2', '3', '4'];
			//separate div for weapon buttons
			div1 = document.createElement('div');	
			for (var i = 0; i < weapons_button_names.length; i++) {
				weapons_buttons.push(this.generateWeaponsButtons(weapons_button_names[i]));
				div1.appendChild(weapons_buttons[i]);
			}

			//separate div for authorise button
			div2 = document.createElement('div');
			div2.setAttribute('class', 'center_align');
			authorise_button = document.createElement('input');
			authorise_button.setAttribute('class', 'unhighlighted_authorise_button');
			authorise_button.setAttribute('type', 'button');
			authorise_button.setAttribute('value', 'Request Authorisation');
			var self = this; 
			authorise_button.addEventListener('click', function() {
				var data = {
					trackId: ftms_ui.track_manager.getSelectedTrack().trackId,
					weaponIds: self.getSelectedWeapons() 
				}
				for(var i = 0; i < weapons_buttons.length; i++) {
					weapons_buttons[i].setAttribute('class', 'unhighlighted_weapons_buttons');
				}
				ftms_ui.event_manager.sendAuthorisationRequest(data);
			});
			div2.appendChild(authorise_button);

			//append the weapons and button divs to display
			display.appendChild(div1);
			display.appendChild(div2);
			
			//append display to window
			ftms_ui.window_manager.appendToWindow('Weapon Authorisation', display);
		},
		generateWeaponsButtons: function(s) {
			var button = document.createElement('input');
			button.setAttribute('class', 'unhighlighted_weapons_buttons');
			button.setAttribute('type', 'button');
			button.setAttribute('value', s);
			button.addEventListener('click', function() {
				if (this.className == 'unhighlighted_weapons_buttons') {
					this.setAttribute('class', 'highlighted_weapons_buttons');
				} else {
					this.setAttribute('class', 'unhighlighted_weapons_buttons');
				}
			});

			return button;
		},
		toggleDisabled: function() {
			for(var i = 0; i < weapons_buttons.length; i++) {
				if(authorise_button.className == 'highlighted_authorise_button') {
					weapons_buttons[i].disabled = true;
					weapons_buttons[i].classList.add('disabled_button');
				}
				else{
					weapons_buttons[i].disabled = false;
					weapons_buttons[i].classList.remove('disabled_button');
				}	 
			}
		},
		getSelectedWeapons: function(){
			var res = [];
			for(var i = 0; i < weapons_buttons.length; i++) {
				if(weapons_buttons[i].className == 'highlighted_weapons_buttons'){
					res.push(weapons_buttons[i].value);
				}
			}
			return res;
		} 
	}
}());