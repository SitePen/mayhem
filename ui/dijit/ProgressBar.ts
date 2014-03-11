import configure = require('./configure');
import dijit = require('./interfaces');
import Dijit = require('dijit/ProgressBar');
import _Widget = require('./_Widget');

class ProgressBar extends _Widget {
	// TODO: interfaces
}

configure(ProgressBar, {
	Base: _Widget,
	Dijit: Dijit,
	schema: {
		indeterminate: Boolean,
		label: String,
		maximum: Number,
		places: String,
		progress: String,
		value: Number,
		onChange: Function
	}
});

export = ProgressBar;
