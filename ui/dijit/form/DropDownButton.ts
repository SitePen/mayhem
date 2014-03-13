import Button = require('./Button');
import configure = require('../util/configure');
import Dijit = require('dijit/form/DropDownButton');
import form = require('./interfaces');
import _WidgetBase = require('../_WidgetBase');

class DropDownButton extends Button implements form.IDropDownButton {
	get:form.IDropDownButtonGet;
	set:form.IDropDownButtonSet;
}

configure(DropDownButton, {
	Base: Button,
	Dijit: Dijit,
	schema: {
		dropDown: { type: _WidgetBase, required: true }
	}
});

export = DropDownButton;
