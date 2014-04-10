import ContentView = require('./ContentView');
import ui = require('./interfaces');

class TextView extends ContentView implements ui.ITextView {
	_formattedText:string;
	_text:string;

	get:ui.ITextViewGet;
	set:ui.ITextViewSet;
}

export = TextView;
