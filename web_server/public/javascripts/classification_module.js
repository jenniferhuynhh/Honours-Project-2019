function ClassificationModule() {

	this.ftms_ui;
	this.div1;
	this.div2;
	this.div3;
	this.dropdown_menu;

	this.initialise = function(ftms_ui){
		//Link FTMS UI system
		this.ftms_ui = ftms_ui;

		//type div
		this.div1 = document.createElement('div');
		var land_types = ['Tank', 'Humvee', 'Desert patrol vehicle'];
		var sea_types = ['Missile boat', 'Naval ship', 'Patrol boat' ];
		var air_types = ['Jet', 'Helicopter', 'Military aircraft'];
		var subsurface_types = ['Submarine'];
		this.dropdown_menu = document.createElement('select');
		this.dropdown_menu.setAttribute('class', 'dropdown_menu');
		this.div1.appendChild(this.dropdown_menu);


		//domain div
		this.div2 = document.createElement('div');
		var div2_buttons = ['Land', 'Sea', 'Subsurface', 'Air']; 
		for (var i = 0; i < div2_buttons.length; i++){
			this.div2.appendChild(this.generateButton(div2_buttons[i]));
		}

		//affiliation div
		this.div3 = document.createElement('div');
		var div3_buttons = ['Friendly', 'Neutral', 'Hostile', 'Unknown']; 
		for (var i = 0; i < div3_buttons.length; i++){
			this.div3.appendChild(this.generateButton(div3_buttons[i]));
		}

		//Show divs
		this.ftms_ui.window_manager.appendToWindow(this.div1, 0, 1);
		this.ftms_ui.window_manager.appendToWindow(this.div2, 0, 1);
		this.ftms_ui.window_manager.appendToWindow(this.div3, 0, 1);

	}

	this.generateButton = function(s){
		var button = document.createElement('input');
		button.setAttribute('class', 'unhighlighted_classification_buttons');
		button.setAttribute('type', 'button');
		button.setAttribute('value', s);
		button.addEventListener('click', function(){
			if (this.className == 'unhighlighted_classification_buttons'){
				this.setAttribute('class', 'highlighted_classification__buttons');
			}
			else{
				this.setAttribute('class', 'unhighlighted_classification_buttons');
			}
		});

		return button;
	}

	//this.

}