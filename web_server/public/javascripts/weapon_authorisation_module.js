function WeaponAuthorisationModule() {

	this.ftms_ui;
	this.div1;
	this.div2;
	//this.weapons_buttons;

	this.initialise = function(ftms_ui){
		//Link FTMS UI system
		this.ftms_ui = ftms_ui;

		//weapons buttons div
		this.div1 = document.createElement('div');
		var weapons_buttons = ['1', '2', '3', '4'];
		//this.weapons_buttons = [];
		for (var i = 0; i < weapons_buttons.length; i++){
			//this.weapons_buttons.push(this.generateButton(weapons_buttons_names[i]);
			//this.div1.appendChild(this.weapons_buttons[i]);
			this.div1.appendChild(this.generateWeaponsButtons(weapons_buttons[i]));
		}
		
		this.ftms_ui.window_manager.appendToWindow(this.div1, 1, 1);

		//authorise button div
		this.div2 = document.createElement('div');
		this.div2.setAttribute('class', 'center_align');
		var authorise_button = document.createElement('input');
		this.div2.appendChild(authorise_button);
		authorise_button.setAttribute('class', 'unhighlighted_authorise_button');
		authorise_button.setAttribute('type', 'button');
		authorise_button.setAttribute('value', 'UNAUTHORISED');
		authorise_button.addEventListener('click', function(){
			if (this.className == 'unhighlighted_authorise_button'){
				this.setAttribute('class', 'highlighted_authorise_button');
				authorise_button.setAttribute('value', 'AUTHORISED');
			}
			else{
				this.setAttribute('class', 'unhighlighted_authorise_button');
				authorise_button.setAttribute('value', 'UNAUTHORISED');
			}
		});

		var auth_button2 = document.createElement('input');
		this.div2.appendChild(auth_button2);
		auth_button2.setAttribute('class', 'unhighlighted_authorise_button');
		auth_button2.setAttribute('type', 'button');
		auth_button2.setAttribute('value', 'AUTHORISE');
		auth_button2.style.margin = '10px';
		auth_button2.addEventListener('click', function(){
			if (this.className == 'unhighlighted_authorise_button'){
				this.setAttribute('class', 'highlighted_authorise_button');
				auth_button2.setAttribute('value', 'AUTHORISED');
			}
			else{
				this.setAttribute('class', 'unhighlighted_authorise_button');
				auth_button2.setAttribute('value', 'AUTHORISE');
			}
		});

		this.ftms_ui.window_manager.appendToWindow(this.div2, 1, 1);
	}

	this.generateWeaponsButtons = function(s){
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