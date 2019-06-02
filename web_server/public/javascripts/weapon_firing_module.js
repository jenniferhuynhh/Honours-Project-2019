function WeaponFiringModule() {

	this.ftms_ui;
	this.display;
	this.div1;
	this.div2;
	this.weapons_buttons = [];
	this.fire_button;

	this.initialise = function(ftms_ui){
		//Link FTMS UI system
		this.ftms_ui = ftms_ui;
		this.display = document.createElement("div");
		this.display.setAttribute('class', 'center_align');
		
		var weapons_button_names = ['1', '2', '3', '4'];
		//weapons buttons div
		this.div1 = document.createElement('div');	
		for (var i = 0; i < weapons_button_names.length; i++) {
			this.weapons_buttons.push(this.generateWeaponsButtons(weapons_button_names[i]));
			this.div1.appendChild(this.weapons_buttons[i]);
		}

		//fire button div
		this.div2 = document.createElement('div');
		this.div2.setAttribute('class', 'center_align');
		this.fire_button = document.createElement('input');
		this.fire_button.setAttribute('class', 'unhighlighted_fire_button');
		this.fire_button.setAttribute('type', 'button');
		this.fire_button.setAttribute('value', 'FIRE');
		this.fire_button.addEventListener('mousedown', function(){
			this.classList.add('highlighted_fire_button');
		})
		this.fire_button.addEventListener('mouseup', function(){
			this.classList.remove('highlighted_fire_button');
		})
		var self = this;
		this.fire_button.addEventListener('click', function(){			
			for(var i=0; i<self.weapons_buttons.length; i++){
				self.weapons_buttons[i].classList.remove('highlighted_weapons_buttons');
			}
			//var audio = new Audio('../resources/boom.mp3');
			//audio.play();
		})
		this.div2.appendChild(this.fire_button);

		this.display.appendChild(this.div1);
		this.display.appendChild(this.div2);
		
		this.ftms_ui.window_manager.appendToWindow('Weapon Firing Module', this.display);
	}

	this.generateWeaponsButtons = function(s){
		var button = document.createElement('input');
		button.setAttribute('class', 'unhighlighted_weapons_buttons');
		button.setAttribute('type', 'button');
		button.setAttribute('value', s);
		button.addEventListener('click', function(){
			if(this.classList.contains('highlighted_weapons_buttons')){
				this.classList.remove('highlighted_weapons_buttons');
			}
			else{
				this.classList.add('highlighted_weapons_buttons');
			}
		});

		return button;
	}

}