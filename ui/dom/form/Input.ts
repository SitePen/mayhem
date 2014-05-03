import _DijitRenderer = require('../_Dijit');

class InputRenderer extends _DijitRenderer {}

InputRenderer.implementation({
	nameMap: {
		readonly: 'readOnly'
	}
});

export = InputRenderer;
