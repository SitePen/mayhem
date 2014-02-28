import _Widget = require('./_Widget');

class _MenuBase extends _Widget {
	static _dijitConfig:any = {
		selected: 'any', // dijit/MenuItem
		popupDelay: 'number',
		passivePopupDelay: 'number',
		autoFocus: 'boolean',
		onKeyboardSearch: { action: true },
		onCancel: { action: true },
		onExecute: { action: true },
		onItemHover: { action: true },
		onItemUnhover: { action: true },
		onItemClick: { action: true },
		onClose: { action: true }
	};
}

_MenuBase.configure(_Widget);

export = _MenuBase;
