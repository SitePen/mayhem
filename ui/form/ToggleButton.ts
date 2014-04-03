/// <amd-dependency path="../renderer!form/ToggleButton" />

import Button = require('./Button');
import form = require('./interfaces');

var Renderer:any = require('../renderer!form/ToggleButton');

class ToggleButton extends Button implements form.IToggleButton {
	_checked:boolean;
	_indeterminate:boolean;

	get:form.IToggleButtonGet;
	set:form.IToggleButtonSet;

	toggle(forceState?:boolean):void {
		this.set('selected', typeof forceState === 'boolean' ? forceState : !this.get('selected'));
	}
}

ToggleButton.prototype._renderer = new Renderer();

export = ToggleButton;
