function WindowManagerGoldenLayout() {
	this.ftms_ui; //FTMS UI system this module is linked to
	this.display; //element object the windows will be displayed in
	this.map = document.createElement("div");

	//Initialises window manager components
	this.initialise = function(ftms_ui) {
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
						componentState: { label: 'B' },
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
						componentName: 'Track Table Module',
						componentState: { label: 'B' }
					},{
						type: 'component',
						componentName: 'Track Classification Module',
						componentState: { label: 'C' },
						height: 60
					}]
				}]
			}]
		};

		this.display = new GoldenLayout(config);//, document.getElementById(this.ftms_ui.display_id));
	}

	this.showAll = function() {
		this.display.init();
	}

	this.appendToWindow = function(windowName, element) {
		this.display.registerComponent(windowName, function(container, componentState) {
		    container.getElement()[0].appendChild(element);
		});
	}
}