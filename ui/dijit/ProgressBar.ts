import Dijit = require('./Dijit');
import _DijitCtor = require('dijit/ProgressBar');

class ProgressBar extends Dijit {
	private _indeterminate:boolean;
	private _maximum:number;
	private _places:number;
	private _value:any; // string | number
}

ProgressBar.prototype._DijitCtor = _DijitCtor;
ProgressBar.prototype._dijitFields = [ 'indeterminate', 'maximum', 'places', 'value' ];

export = ProgressBar;
