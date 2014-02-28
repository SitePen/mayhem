import _FormWidget = require('./_FormWidget');

class _FormValueWidget extends _FormWidget {
	static _dijitConfig:any = {
		readOnly: 'boolean'
	};
}

_FormValueWidget.configure(_FormWidget);

export = _FormValueWidget;
