import SingleNodeWidget = require('../SingleNodeWidget');
import util = require('../../../util');

class FormInput extends SingleNodeWidget {
	debounceRate:number;
	firstNode:HTMLInputElement;
	lastNode:HTMLInputElement;
	value:string;

	constructor(kwArgs:Object = {}) {
		this.debounceRate = 100;
		super(kwArgs);
	}

	_debounceRateSetter(value:number):void {
		this.debounceRate = value;
		this._listen();
	}

	destroy():void {
		this.firstNode.oninput = null;
		super.destroy();
	}

	_listen():void {
		if (this.firstNode) {
			this.firstNode.oninput = util.debounce((event:Event):void => {
				this.set('value', this.firstNode.value);
			}, this.debounceRate);
		}
	}

	render():void {
		this.firstNode = this.lastNode = document.createElement('input');
		this._listen();
	}

	_valueSetter(value:string):void {
		this.value = value;

		// Setting the value of the input field causes the cursor to move to the end of the field in at least
		// Chrome 32, even if the values are identical
		if (this.firstNode.value !== '' + value) {
			this.firstNode.value = value;
		}
	}
}

export = FormInput;
