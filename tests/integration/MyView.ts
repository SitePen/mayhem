import FormError = require('framework/ui/form/Error');
import FormLabel = require('framework/ui/form/Label');
import Master = require('framework/ui/Master');
import TextInput = require('framework/ui/form/TextInput');

class MyView extends Master {
	private _input:TextInput;
	private _label:FormLabel;
	private _error:FormError;

	_render():void {
		super._render();

		this._label = new FormLabel({
			// TODO: reimplement deferred bind
			app: this.get('app'),
			mediator: this.get('mediator'),
			id: 'label1',
			'for': 'input1'
		});
		this._label.bind({
			sourceBinding: 'firstName!label',
			targetBinding: 'text'
		});

		this._input = new TextInput({
			// TODO: reimplement deferred bind
			app: this.get('app'),
			mediator: this.get('mediator'),
			id: 'input1'
		});
		this._input.bind({
			sourceBinding: 'firstName',
			targetBinding: 'value',
			twoWay: true
		});
		this._input.bind({
			sourceBinding: 'firstName!label',
			targetBinding: 'placeholder'
		});

		this._error = new FormError({
			// TODO: reimplement deferred bind
			app: this.get('app'),
			mediator: this.get('mediator'),
			id: 'error1'
		});
		this._error.bind({
			sourceBinding: 'firstName!errors',
			targetBinding: 'errors'
		});

		this.add(this._label);
		this.add(this._input);
		this.add(this._error);
	}
}

export = MyView;
