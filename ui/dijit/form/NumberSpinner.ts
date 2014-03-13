import configure = require('../util/configure');
import Dijit = require('dijit/form/NumberSpinner');
import form = require('./interfaces');
import _Spinner = require('./_Spinner');

class NumberSpinner extends _Spinner {
	// TODO: interfaces
}

configure(NumberSpinner, {
	Base: _Spinner,
	Dijit: Dijit,
	schema: {
		// TODO
	}
	// TODO: NumberTextBox.Mixin
});

export = NumberSpinner;
