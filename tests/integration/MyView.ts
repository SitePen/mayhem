import Master = require('framework/ui/dom/Master');
import Input = require('framework/ui/dom/form/TextBox');
import Label = require('framework/ui/dom/form/Label');
import FormError = require('framework/ui/dom/form/Error');

class MyView extends Master {
	private _input:Input;
	private _label:Label;
	private _error:FormError;

	_render():void {
		super._render();

		this._label = new Label({});
		this._label.bind('binding', 'firstName');

		this._input = new Input({});
		this._input.bind('value', 'firstName', { direction: 2 });

		this._error = new FormError({});
		this._error.bind('binding', 'firstName');

		this.add(this._label);
		this.add(this._input);
		this.add(this._error);
	}
}

export = MyView;
