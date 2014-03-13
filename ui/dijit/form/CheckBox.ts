import _CheckBoxMixin = require('./_CheckBoxMixin');
import configure = require('../util/configure');
import Dijit = require('dijit/form/CheckBox');
import form = require('./interfaces');
import ToggleButton = require('./ToggleButton');

class CheckBox extends ToggleButton implements form.ICheckBox {
	get:form.ICheckBoxGet;
	set:form.ICheckBoxSet;
}

configure(CheckBox, {
	Base: ToggleButton,
	Dijit: Dijit,
	mixins: [ _CheckBoxMixin ]
});

export = CheckBox;
