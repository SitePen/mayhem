import CheckBoxImpl = require('dijit/form/CheckBox');
import _DijitRenderer = require('../_Dijit');

class CheckboxRenderer extends _DijitRenderer {}

CheckboxRenderer.implementation({
	constructor: CheckBoxImpl
});

export = CheckboxRenderer;
