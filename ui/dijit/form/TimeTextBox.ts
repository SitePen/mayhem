import _DijitWidget = require('dijit/form/TimeTextBox');
import RangeBoundTextBox = require('./RangeBoundTextBox');

class TimeTextBox extends RangeBoundTextBox {
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

// TODO: catalog textboxes
TimeTextBox.configure(RangeBoundTextBox);

export = TimeTextBox;
