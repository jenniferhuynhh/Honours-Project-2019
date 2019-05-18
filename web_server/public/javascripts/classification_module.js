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
	this.div2_buttons;
	this.div3_buttons;

	this.initialise = function(ftms_ui){
		//Link FTMS UI system
		this.ftms_ui = ftms_ui;

		//type div
		this.div1 = document.createElement('div');
		var text = document.createTextNode('Type: ');		
		var div = document.createElement('div');
		div.appendChild(text);
		div.setAttribute('class', 'dropdown_container');
		this.div1.setAttribute('class', 'center_align');
		this.land_types = ['Tank', 'Humvee', 'Desert patrol vehicle'];
		this.sea_types = ['Missile boat', 'Naval ship', 'Patrol boat' ];
		this.air_types = ['Jet', 'Helicopter', 'Military aircraft'];
		this.subsurface_types = ['Submarine', 'Torpedo'];
		this.dropdown_menu = document.createElement('select');
		this.dropdown_menu.setAttribute('class', 'dropdown_menu');
		var self = this;
		this.dropdown_menu.addEventListener('change', function(){
			self.updateTrack('type', this.value.toLowerCase());
		});
		div.appendChild(this.dropdown_menu);
		this.div1.appendChild(div);


		//domain div
		this.div2 = document.createElement('div');
		var div2_buttons_names = ['Land', 'Sea', 'Subsurface', 'Air']; 
		this.div2_buttons = []; 
		for (var i = 0; i < div2_buttons_names.length; i++){
			this.div2_buttons.push(this.generateButton(div2_buttons_names[i], 'domain'));
			this.div2.appendChild(this.div2_buttons[i]);
		}
		this.div2.setAttribute('class', 'classification_buttons_container');

		//affiliation div
		this.div3 = document.createElement('div');
		var div3_buttons_names = ['Friendly', 'Neutral', 'Hostile', 'Unknown']; 
		this.div3_buttons = [];
		for (var i = 0; i < div3_buttons_names.length; i++){
			this.div3_buttons.push(this.generateButton(div3_buttons_names[i], 'affiliation'));
			this.div3.appendChild(this.div3_buttons[i]);
		}
		this.div3.setAttribute('class', 'classification_buttons_container');

		//Show divs
		this.ftms_ui.window_manager.appendToWindow(this.div1, 0, 1);
		this.ftms_ui.window_manager.appendToWindow(this.div2, 0, 1);
		this.ftms_ui.window_manager.appendToWindow(this.div3, 0, 1);

	}

	this.generateButton = function(s, property){
		var button = document.createElement('input');
		button.setAttribute('class', 'unhighlighted_classification_buttons');
		button.setAttribute('type', 'button');
		button.setAttribute('value', s);
		var self = this;
		button.addEventListener('click', function(){
			self.updateTrack(property, s.toLowerCase());
		});

		return button;
	}

	this.updateTrack = function(property,value){
		
		var track_id = this.ftms_ui.track_table_module.selected_track_id;
		//if nothing is selected
		if(track_id < 0){
			this.clearFields(); 
			return;
		} 
		var track = this.ftms_ui.simulator.getTrack(track_id);

		if(property == 'affiliation'){
			track.affiliation = value;
		}
		else if(property == 'domain'){
			track.domain = value;
		}
		else if(property == 'type'){
			track.type = value;
		}
		this.updateDisplay();
	}

	this.updateDisplay = function(){
		
		var track_id = this.ftms_ui.track_table_module.selected_track_id;
		//if nothing is selected
		if(track_id < 0){
			this.clearFields(); 
			return;
		} 
		var track = this.ftms_ui.simulator.getTrack(track_id);
		
		//this updates the dropdown menu
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
		var option = document.createElement('option');
		option.innerHTML = "";
		this.dropdown_menu.appendChild(option);
		for(var i = 0; i < selected_array.length; i++){
			var option = document.createElement('option');
			option.innerHTML = selected_array[i];
			if(track.type == option.innerHTML.toLowerCase()){
				option.selected = true;
			}
			this.dropdown_menu.appendChild(option);
		}

		//this updates the domain buttons
		for(var i = 0; i < this.div2_buttons.length; i++){
			if(this.div2_buttons[i].value.toLowerCase() == track.domain){
				this.div2_buttons[i].setAttribute('class', 'highlighted_classification__buttons');
			}
			else{
				this.div2_buttons[i].setAttribute('class', 'unhighlighted_classification_buttons');
			}
		}

		//this updates the affiliation buttons
		for(var i = 0; i < this.div3_buttons.length; i++){
			if(this.div3_buttons[i].value.toLowerCase() == track.affiliation){
				this.div3_buttons[i].setAttribute('class', 'highlighted_classification__buttons');
			}
			else{
				this.div3_buttons[i].setAttribute('class', 'unhighlighted_classification_buttons');
			}
		}

		this.ftms_ui.track_table_module.updateTrackTable();
	}

	//this function clears the dropdown menu and deselects domain and affiliation buttons
	this.clearFields = function(){	
		this.dropdown_menu.innerHTML = "";

		for(var i = 0; i < this.div2_buttons.length; i++){
			this.div2_buttons[i].setAttribute('class', 'unhighlighted_classification_buttons');
		}

		for(var i = 0; i < this.div3_buttons.length; i++){
			this.div3_buttons[i].setAttribute('class', 'unhighlighted_classification_buttons');
		}
	}
}