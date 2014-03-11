import configure = require('./configure');
import dijit = require('./interfaces');
import _MenuItem = require('dijit/MenuItem');
import _Widget = require('./_Widget');

class _MenuBase extends _Widget {
	// TODO: interfaces
}

configure(_MenuBase, {
	Base: _Widget,
	schema: {
		selected: _MenuItem,
		popupDelay: Number,
		passivePopupDelay: Number,
		autoFocus: Boolean,
		onKeyboardSearch: Function,
		onCancel: Function,
		onExecute: Function,
		onItemHover: Function,
		onItemUnhover: Function,
		onItemClick: Function,
		onClose: Function
	}
});

export = _MenuBase;
