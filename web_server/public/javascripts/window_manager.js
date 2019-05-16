function WindowManager() {
	this.ftms_ui; //FTMS UI system this module is linked to
	this.display; //element object the windows will be displayed in
	this.windows; //group of window objects

	//Initialises window manager components
	this.initialise = function(ftms_ui) {
		//Link FTMS UI system
		this.ftms_ui = ftms_ui;

		//Find area to display
		this.display = document.getElementById(this.ftms_ui.display_id);
		
		//Generate divs
		this.generateDivs();
	}

	//Generates the window manager's initial divs
	this.generateDivs = function() {
		this.windows = document.createElement("table");
		this.windows.setAttribute("class", "window_manager");
		for(var i = 0; i < 5; i++) {
			var row = document.createElement("tr");
			for(var j = 0; j < 5; j++) {
				var td = document.createElement("td");
				row.appendChild(td);
			}
			this.windows.appendChild(row);
		}
		this.display.appendChild(this.windows);
	}

	//Appends an element to a window
	this.appendToWindow = function(element, row, column) {
		this.windows.rows[row].cells[column].appendChild(element);
	}

	//Returns the window corresponding to the coordinates
	this.getWindow = function(row, column) {
		return this.windows.rows[row].cells[column];
	}
}