var AuthorisationApprovalModule = (function() {
	//Private
	var ftms_ui;
	var display;

	//Public 
	return {
		initialise: function(ftms) {
			//link FTMS UI system
			ftms_ui = ftms;

			//create div for the module
			display = document.createElement("div");
			display.setAttribute('class', 'center_align');
			
			//append display to window
			ftms_ui.window_manager.appendToWindow('Authorisation Approval Module', display);
		}
	}
}());