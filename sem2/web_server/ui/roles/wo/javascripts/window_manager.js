var WindowManager = (function() {
	
	//private
	var ftms_ui; //FTMS UI system this module is linked to
	var display; //GoldenLayout object

	//public
	return {
		//Initialises GoldenLayout window manager components
		initialise: function(ftms) {
			log("Window manager initialising...");
		
			//Link FTMS UI system
			ftms_ui = ftms;

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
							type: 'row',
							content:[{
								type: 'component',
								componentName: 'Alert Module',
								isClosable: false,
								width: 65
							},{
								type: 'component',
								componentName: 'Messaging Module',
								isClosable: false
							}],
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

			display = new GoldenLayout(config,document.getElementById("goldenlayout"));

			log("Window manager initialised");
		},

		//Displays all windows
		showAll: function() {
			display.init();
		},

		//Appends given element to component with given windowName
		appendToWindow: function(windowName, element) {
			display.registerComponent(windowName, function(container, componentState) {
				container.getElement()[0].appendChild(element);
			});
		}	
	}
}());