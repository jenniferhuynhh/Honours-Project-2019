function WeaponAuthorisationModule() {

	this.ftms_ui;
	this.display;
	this.div1;
	this.div2;
	//this.weapons_buttons;

	this.initialise = function(ftms_ui){
		//Link FTMS UI system
		this.ftms_ui = ftms_ui;
		this.display = document.createElement("div");
		this.display.setAttribute('class', 'center_align');
		
		var weapons_buttons = ['1', '2', '3', '4'];
		//weapons buttons div
		this.div1 = document.createElement('div');	
		for (var i = 0; i < weapons_buttons.length; i++) {
			this.div1.appendChild(this.generateWeaponsButtons(weapons_buttons[i]));
		}

		//authorise button div
		this.div2 = document.createElement('div');
		this.div2.setAttribute('class', 'center_align');
		var authorise_button = document.createElement('input');
		authorise_button.setAttribute('class', 'unhighlighted_authorise_button');
		authorise_button.setAttribute('type', 'button');
		authorise_button.setAttribute('value', 'Request Authorisation');
		authorise_button.addEventListener('click', function(){
			if (this.className == 'unhighlighted_authorise_button'){
				this.setAttribute('class', 'highlighted_authorise_button');
			}
			else{
				this.setAttribute('class', 'unhighlighted_authorise_button');
			}
		});
		this.div2.appendChild(authorise_button);

		this.display.appendChild(this.div1);
		this.display.appendChild(this.div2);
		
		this.ftms_ui.window_manager.appendToWindow('Weapon Authorisation Module', this.display);
	}

	this.generateWeaponsButtons = function(s){
		var button = document.createElement('input');
		button.setAttribute('class', 'unhighlighted_weapons_buttons');
		button.setAttribute('type', 'button');
		button.setAttribute('value', s);
		button.addEventListener('click', function(){
			if (this.className == 'unhighlighted_weapons_buttons') {
				this.setAttribute('class', 'highlighted_weapons_buttons');
			} else {
				this.setAttribute('class', 'unhighlighted_weapons_buttons');
			}
		});

		return button;
	}
}