import CheckBox = require('./CheckBox');
import configure = require('../dijit/util/configure');
import DijitBase = require('../dijit/form/RadioButton');
import form = require('./interfaces');
import util = require('../../util');

class RadioButton extends CheckBox implements form.IRadioButton {
	get:form.IRadioButtonGet;
	set:form.IRadioButtonSet;
}

util.applyMixins(RadioButton, [ DijitBase ]);

configure(RadioButton, {
	Base: CheckBox,
	mixins: [ DijitBase ]
});

export = RadioButton;
