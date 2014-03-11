import configure = require('../dijit/configure');
import DijitBase = require('../dijit/form/CheckBox');
import form = require('./interfaces');
import ToggleButton = require('./ToggleButton');
import util = require('../../util');

class CheckBox extends ToggleButton implements form.ICheckBox {
	get:form.ICheckBoxGet;
	set:form.ICheckBoxSet;
}

util.applyMixins(CheckBox, [ DijitBase ]);

configure(CheckBox, {
	Base: ToggleButton,
	mixins: [ DijitBase ]
});

export = CheckBox;
