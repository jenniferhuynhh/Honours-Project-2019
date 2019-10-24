var WindowManager = (function() {
	
	//private
	var ftms_ui; //FTMS UI system this module is linked to
	var display; //GoldenLayout object
	var config;

	//public
	return {
		//Initialises GoldenLayout window manager components
		initialise: function(ftms, layout) {
			log("Window manager initialising...");
		
			//Link FTMS UI system
			ftms_ui = ftms;

			//if no default or loaded layout is found
			config = {
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
								componentName: 'Authorisation Approval Module',
								isClosable: false,
								height: 30	
							},{
								type: 'component',
								componentName: 'Settings Module',
								isClosable: false,
								height: 30
							}]
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
							},{
								type: 'component',
								componentName: 'Replay Module',
								isClosable: false,
								height: 40
							}]
						}]
					}]
				}]
			};

			//save recommended config
			var recommended_layout = {
					layout_config: JSON.stringify(config),
					layout_name: "(Recommended)"
			}
			ftms_ui.event_manager.saveLayout(recommended_layout);

			this.decideLayout(layout);
			 
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
		},	

		//Decides what layout to load
		decideLayout: function(loaded_layout) {
			var default_layout = ftms_ui.settings_manager.getSetting("default_layout");
			//if layout is chosen from dropdown menu
			if(loaded_layout){
				config = JSON.parse(loaded_layout);
			}
			//if default layout was found in user settings
			else if(default_layout != ""){
				config = JSON.parse(default_layout);
			}
		},

		getConfig: function() {
			return display.toConfig();
		}
	}
}());