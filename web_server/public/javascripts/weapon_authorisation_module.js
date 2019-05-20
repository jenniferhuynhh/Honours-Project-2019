function WeaponAuthorisationModule() {

	this.ftms_ui;
	this.div1;
	//this.div2;
	//this.weapons_buttons;

	this.initialise = function(ftms_ui){
		//Link FTMS UI system
		this.ftms_ui = ftms_ui;

		this.div1 = document.createElement('div');
		var weapons_buttons = ['1', '2', '3', '4'];
		//this.weapons_buttons = [];
		for (var i = 0; i < weapons_buttons.length; i++){
			//this.weapons_buttons.push(this.generateButton(weapons_buttons_names[i]);
			//this.div1.appendChild(this.weapons_buttons[i]);
			this.div1.appendChild(this.generateButton(weapons_buttons[i]));
		}
		

		this.ftms_ui.window_manager.appendToWindow(this.div1, 1, 1);
	}

	this.generateButton = function(s){
		var button = document.createElement('input');
		button.setAttribute('class', 'unhighlighted_weapons_buttons');
		button.setAttribute('type', 'button');
		button.setAttribute('value', s);
		button.addEventListener('click', function(){
			if (this.className == 'unhighlighted_weapons_buttons'){
				this.setAttribute('class', 'highlighted_weapons_buttons');
			}
			else{
				this.setAttribute('class', 'unhighlighted_weapons_buttons');
			}
		});

		return button;
	}

}