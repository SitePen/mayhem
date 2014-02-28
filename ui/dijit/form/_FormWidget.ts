import _Widget = require('../_Widget');

class _FormWidget extends _Widget {
	static _dijitConfig:any = {
		// _FormWidgetMixin
		name: 'string',
		alt: 'string',
		value: 'string',
		type: 'string',
		'aria-label': 'string',
		tabIndex: 'string',
		disabled: 'boolean',
		intermediateChanges: 'string',
		scrollOnFocus: 'string'	
	};
}

_FormWidget.configure(_Widget);

export = _FormWidget;
