function ClassificationModule() {

	this.ftms_ui;
	this.div1;
	this.div2;
	this.div3;
	this.dropdown_menu;
	this.land_types;
	this.sea_types;
	this.air_types;
	this.subsurface_types;

	this.initialise = function(ftms_ui){
		//Link FTMS UI system
		this.ftms_ui = ftms_ui;

		//type div
		this.div1 = document.createElement('div');
		this.land_types = ['Tank', 'Humvee', 'Desert patrol vehicle'];
		this.sea_types = ['Missile boat', 'Naval ship', 'Patrol boat' ];
		this.air_types = ['Jet', 'Helicopter', 'Military aircraft'];
		this.subsurface_types = ['Submarine', 'Torpedo'];
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

	this.updateDisplay = function(){
		var track_id = this.ftms_ui.track_table_module.selected_track_id;
		var track = this.ftms_ui.simulator.getTrack(track_id);
		this.dropdown_menu.innerHTML = "";
		var selected_array;
		if(track.domain == 'land'){
			selected_array = this.land_types;
		} else if(track.domain == 'air'){
			selected_array = this.air_types;
		} else if(track.domain == 'sea'){
			selected_array = this.sea_types;
		} else if(track.domain == 'subsurface'){
			selected_array = this.subsurface_types;
		}
		for(var i = 0; i < selected_array.length; i++){
			var option = document.createElement('option');
			option.innerHTML = selected_array[i];
			this.dropdown_menu.appendChild(option);
		}

	}

}