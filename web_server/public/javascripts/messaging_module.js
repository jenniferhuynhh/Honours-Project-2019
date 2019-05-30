function MessagingModule() {
	this.ftms_ui;
	this.display;

	//Declares track types/domains/affilitations and generates display elements
	this.initialise = function(ftms_ui) {
		//Link FTMS UI system
		this.ftms_ui = ftms_ui;

		var socket = io();

		//Create div for elements to sit in
		this.display = document.createElement("div");

		this.ftms_ui.window_manager.appendToWindow('Messaging Module', this.display);
	}
}