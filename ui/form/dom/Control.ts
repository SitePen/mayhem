import _DijitRenderer = require('../../dom/_Dijit');

class Control extends _DijitRenderer {
}

Control.delegate(Control, '_dijitRename', {
	tabindex: 'tabIndex'
});

export = Control;
