var SettingsModule = (function() {
	//Private
		var ftms_ui;
		var display;
		var dropdown;
		var layouts;

	//Public
	return {
		init: function(ftms) {
			//link FTMS UI system
			ftms_ui = ftms;

			//create div for the module
			display = document.createElement("div");
			display.classList.add("settings_module");

			var settings_table = document.createElement("table");
			settings_table.classList.add("settings");

			settings_table.appendChild(this.generateToggleOptions("Audio", "audio_on"));
			settings_table.appendChild(this.generateToggleOptions("Dark Theme", "dark_theme"));
			settings_table.appendChild(this.generateToggleOptions("Colour Blind Mode", "colourblind"));
			settings_table.appendChild(this.generateIconSizeSlider("Icon Sizing", "icon_sizing"));
			settings_table.appendChild(this.generateTextbox("Ownship ID", "ownship_id"));
			settings_table.appendChild(this.generateLoadLayout());
			settings_table.appendChild(this.generateSaveLayout());
			display.appendChild(settings_table);

			ftms_ui.event_manager.loadLayouts();

			//append display to window
			ftms_ui.window_manager.appendToWindow('Settings', display);
		},

		generateToggleOptions: function(name, setting){
			var row = document.createElement("tr");
			var col1 = document.createElement("td");
			var col2 = document.createElement("td");

			col1.classList.add("settings_cells");
			col1.appendChild(document.createTextNode(name));

			var label = document.createElement("label");
			var input = document.createElement("input");
			var span = document.createElement("span");
			label.classList.add("switch");
			input.type = "checkbox";
			input.addEventListener("change", () => ftms_ui.settings_manager.toggleSetting(setting));
			input.checked = ftms_ui.settings_manager.getSetting(setting);
			span.classList.add("slider", "round");

			label.appendChild(input);
			label.appendChild(span);
			col2.appendChild(label);

			row.appendChild(col1);
			row.appendChild(col2);
			return row;
		},

		generateTextbox: function(name, setting){
			var row = document.createElement("tr");
			var col1 = document.createElement("td");
			var col2 = document.createElement("td");

			col1.classList.add("settings_cells");
			col1.appendChild(document.createTextNode(name));

			var input = document.createElement("input");
			input.type = "textbox";
			input.value = ftms_ui.settings_manager.getSetting(setting);
			input.placeholder = setting;
			input.addEventListener("keyup", () => {
				ftms_ui.settings_manager.changeSetting(setting, input.value);
			});
			col2.appendChild(input);

			row.appendChild(col1);
			row.appendChild(col2);
			return row;
		},

		generateIconSizeSlider: function(name, setting){
			var row = document.createElement("tr");
			var col1 = document.createElement("td");
			var col2 = document.createElement("td");

			col1.classList.add("settings_cells");
			col1.appendChild(document.createTextNode(name));

			var input = document.createElement("input");
			input.type = "range";
			input.min = "5";
			input.max = "30";
			input.value = ftms_ui.settings_manager.getSetting("icon_sizing");
			input.classList.add("icon_slider");
			input.addEventListener("change", () => ftms_ui.settings_manager.changeSetting(setting, input.value));

			col2.appendChild(input);
			row.appendChild(col1);
			row.appendChild(col2);

			return row;
		},

		generateLoadLayout: function(){
			var row = document.createElement("tr");
			var col1 = document.createElement("td");
			var col2 = document.createElement("td");

			row.classList.add("setting_rows");
			col1.classList.add("left_padding");
			col2.classList.add("right_padding");

			dropdown = document.createElement("select");
			dropdown.classList.add("layout_dropdown");

			var load_button = document.createElement("input");
			load_button.classList.add("layout_buttons");
			load_button.setAttribute("type", "button");
			load_button.setAttribute("value", "Load");
			load_button.addEventListener("click", function(){ //Load a selected layout
				var selected = dropdown.options[dropdown.selectedIndex].text;
				for(var i = 0; i < layouts.length; i++){
					if(layouts[i].name == selected){
						document.getElementById("goldenlayout").innerHTML = "";
						document.getElementById("header").innerHTML = "";
						ftms_ui.init(layouts[i].layout);
					}
				}
			});

			var default_button = document.createElement("input");
			default_button.classList.add("layout_buttons");
			default_button.setAttribute("type", "button");
			default_button.setAttribute("value", "Set As Default");
			default_button.addEventListener("click", ()=>{
				for(var i = 0; i < layouts.length; i++){ //Save default layout as a setting
					if(dropdown.options[dropdown.selectedIndex].text == layouts[i].name){
						ftms_ui.settings_manager.changeSetting("default_layout", layouts[i].layout); 
					}
				}
			});

			col1.appendChild(dropdown);
			col2.appendChild(load_button);
			col2.appendChild(default_button);
			row.appendChild(col1);
			row.appendChild(col2);

			return row;
		},

		generateSaveLayout: function(){
			var row = document.createElement("tr");
			var col1 = document.createElement("td");
			var col2 = document.createElement("td");

			row.classList.add("setting_rows");
			col1.classList.add("left_padding");
			col2.classList.add("right_padding");

			var textbox = document.createElement("input");
			textbox.classList.add("save_textbox");
			textbox.setAttribute("type", "textbox");
			textbox.setAttribute("id", "layoutName");
			textbox.setAttribute("placeholder", "Save your layout");

			var button = document.createElement("input");
			button.classList.add("save_button");
			button.setAttribute("type", "button");
			button.setAttribute("value", "Save");
			button.addEventListener("click", function(){
				var layout = {
					layout_config: JSON.stringify(ftms_ui.window_manager.getConfig()),
					layout_name: document.getElementById("layoutName").value
				}
				ftms_ui.event_manager.saveLayout(layout);
				setTimeout(function(){ftms_ui.event_manager.loadLayouts()}, 200);
				document.getElementById("layoutName").value = "";
			});

			col1.appendChild(textbox);
			col2.appendChild(button);
			row.appendChild(col1);
			row.appendChild(col2);

			return row;
		},

		receiveLayouts: function(data) {
			layouts = data;
			while(dropdown.options.length > 0) dropdown.remove(0);
			for(var i = 0; i < data.length; i++){
				var option = document.createElement("option");
				option.innerHTML = data[i].name;
				dropdown.appendChild(option);
			}
		}
	}
}());