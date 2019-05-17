function WindowManagerGoldenLayout() {
	this.ftms_ui; //FTMS UI system this module is linked to
	this.display; //element object the windows will be displayed in

	//Initialises window manager components
	this.initialise = function(ftms_ui) {
		//Link FTMS UI system
		this.ftms_ui = ftms_ui;

		var config = {
			content: [{
				type: 'row',
				content:[{
					type: 'component',
					componentName: 'Map Module',
					componentState: { label: 'A' }
				},{
					type: 'column',
					content:[{
						type: 'component',
						componentName: 'Track Table Module',
						componentState: { label: 'B' }
					},{
						type: 'component',
						componentName: 'Track Classification Module',
						componentState: { label: 'C' }
					}]
				}]
			}]
		};

		this.display = new GoldenLayout( config );//, document.getElementById(this.ftms_ui.display_id));

		this.display.registerComponent( 'Map Module', function( container, componentState ){
		    container.getElement().html( '<h2>' + componentState.label + '</h2>' );
		});
		this.display.registerComponent( 'Track Table Module', function( container, componentState ){
		    container.getElement().html( '<h2>' + componentState.label + '</h2>' );
		});
		this.display.registerComponent( 'Track Classification Module', function( container, componentState ){
		    container.getElement().html( '<h2>' + componentState.label + '</h2>' );
		});
		this.display.init();
	}

	this.appendToWindow = function(element, row, column) {
		var comp = this.display.getComponent( 'Map Module' );
		var temp = comp.getElement();
	}
}