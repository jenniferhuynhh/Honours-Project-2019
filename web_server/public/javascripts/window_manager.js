function WindowManager() {
	this.ftms_ui; //FTMS UI system this module is linked to
	this.display; //GoldenLayout object

	//Initialises GoldenLayout window manager components
	this.initialise = function(ftms_ui) {
		log("Window manager initialising...");
		
		//Link FTMS UI system
		this.ftms_ui = ftms_ui;

		var config = {
			settings: {
				showPopoutIcon: false
			},
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
						isClosable: false,
						height: 20
					}],
					width: 65
				},{
					type: 'column',
					content:[{
						type: 'component',
						componentName: 'Track Table Module',
						isClosable: false
					},{
						type: 'component',
						componentName: 'Track Classification Module',
						isClosable: false,
						height: 40
					},{
						type: 'stack',
						content: [{
							type: 'component',
							componentName: 'Weapon Authorisation Module',
							isClosable: false,
							height: 30
						},{
							type: 'component',
							componentName: 'Weapon Firing Module',
							isClosable: false,
							height: 30
						}]
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