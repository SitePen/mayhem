import FormError = require('framework/ui/form/Error');
import FormLabel = require('framework/ui/form/Label');
import View = require('framework/ui/View');
import TextInput = require('framework/ui/form/TextInput');

class MyView extends View {
	private _input:TextInput;
	private _label:FormLabel;
	private _fullNameLabel:FormLabel;
	private _error:FormError;

	/* protected */ _render():void {
		super._render();

		this._label = new FormLabel({
			id: 'label1',
			'for': 'input1'
		});
		this._input = new TextInput({
			id: 'input1'
		});
		this._fullNameLabel = new FormLabel({
			id: 'label2'
		});
		this._error = new FormError({
			id: 'error1'
		});

		this.bind({
			sourceBinding: 'firstName!label',
			target: this._label,
			targetBinding: 'text'
		});
		this.bind({
			sourceBinding: 'firstName',
			target: this._input,
			targetBinding: 'value',
			twoWay: true
		});
		this.bind({
			sourceBinding: 'firstName!label',
			target: this._input,
			targetBinding: 'placeholder'
		});
		this.bind({
			sourceBinding: 'fullName',
			target: this._fullNameLabel,
			targetBinding: 'text'
		});
		this.bind({
			sourceBinding: 'firstName!errors',
			target: this._error,
			targetBinding: 'errors'
		});

		this.add(this._label);
		this.add(this._input);
		this.add(this._fullNameLabel);
		this.add(this._error);
	}
}

export = MyView;
