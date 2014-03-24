import DijitRenderer = require('../_Dijit');

class InputRenderer extends DijitRenderer {}

InputRenderer.implementation({
	nameMap: {
		readonly: 'readOnly'
	}
});

export = InputRenderer;
