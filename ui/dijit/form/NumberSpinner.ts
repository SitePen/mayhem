import _DijitWidget = require('dijit/form/NumberSpinner');
import _Spinner = require('./_Spinner');

class NumberSpinner extends _Spinner {
	// TODO: NumberTextBox.Mixin
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

NumberSpinner.configure(_Spinner);

export = NumberSpinner;
