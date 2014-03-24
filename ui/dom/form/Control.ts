import DijitRenderer = require('../_Dijit');

class ControlRenderer extends DijitRenderer {}

ControlRenderer.implementation({
	nameMap: {
		tabindex: 'tabIndex'
	}
});

export = ControlRenderer;
