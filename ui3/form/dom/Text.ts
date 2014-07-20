class Text {
	private _input:HTMLInputElement;

	constructor() {

	}

	_valueSetter(value:string):void {
		this._input.value = value;
	}

	_placeholderSetter(value:string):void {
		this._input.placeholder = value;
	}
}

export = Text;
