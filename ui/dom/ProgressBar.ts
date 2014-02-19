import DijitWidget = require('./DijitWidget');
import __ProgressBar = require('dijit/ProgressBar');

class ProgressBar extends DijitWidget {
	private _indeterminate:boolean;
	private _maximum:number;
	private _places:number;
	private _value:any; // string | number

	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__ProgressBar);
		this._setDijitFields('indeterminate', 'maximum', 'places', 'value');
		super(kwArgs);
	}
}

export = ProgressBar;