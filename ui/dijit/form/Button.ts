import _ButtonMixin = require('./_ButtonMixin');
import configure = require('../configure');
import Dijit = require('dijit/form/Button');
import form = require('./interfaces');
import _FormWidget = require('./_FormWidget');

class Button extends _FormWidget implements form.IButton {
	get:form.IButtonGet;
	set:form.IButtonSet;
}

configure(Button, {
	Base: _FormWidget,
	Dijit: Dijit,
	mixins: [ _ButtonMixin ],
	schema: {
		iconClass: String,
		showLabel: Boolean
	}
});

export = Button;
