function WindowManager() {
	this.ftms_ui; //FTMS UI system this module is linked to
	this.display; //GoldenLayout object

	//Initialises GoldenLayout window manager components
	this.initialise = function(ftms_ui) {
		log("Window manager initialising...");
		
		//Link FTMS UI system
		this.ftms_ui = ftms_ui;

		var config = {
			content: [{
				type: 'row',
				content:[{
					type: 'column',
					content:[{
						type: 'component',
						componentName: 'Map Module',
						isClosable: false
					},{
						type: 'component',
						componentName: 'Alert Module',
						height: 20
					}],
					width: 65
				},{
					type: 'column',
					content:[{
						type: 'component',
						componentName: 'Track Table Module'
					},{
						type: 'component',
						componentName: 'Track Classification Module',
						height: 40
					},{
						type: 'component',
						componentName: 'Weapon Authorisation Module',
						height: 30
					}]
				}]
			}]
		};

		this.display = new GoldenLayout(config);

		log("Window manager initialised");
	}

	//Displays all windows
	this.showAll = function() {
		this.display.init();
	}

	//Appends given element to component with given windowName
	this.appendToWindow = function(windowName, element) {
		this.display.registerComponent(windowName, function(container, componentState) {
		    container.getElement()[0].appendChild(element);
		});
	}
}