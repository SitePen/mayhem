import _DijitWidget = require('dijit/ProgressBar');
import _Widget = require('./_Widget');

class ProgressBar extends _Widget {
	static _dijitConfig:any = {
		indeterminate: 'boolean',
		label: 'string',
		maximum: 'number',
		places: 'string',
		progress: 'string',
		value: 'number',
		onChange: { action: true }
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

ProgressBar.configure(_Widget);

export = ProgressBar;
