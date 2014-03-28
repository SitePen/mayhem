import ContentView = require('./ContentView');
import ui = require('./interfaces');

class TextView extends ContentView implements ui.ITextView {
	/* protected */ _values:ui.ITextViewValues;

	get:ui.ITextViewGet;
	set:ui.ITextViewSet;
}

export = TextView;
