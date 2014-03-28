import ControlRenderer = require('./Control');

class InputRenderer extends ControlRenderer {}

InputRenderer.implementation({
	nameMap: {
		readonly: 'readOnly'
	}
});

export = InputRenderer;
