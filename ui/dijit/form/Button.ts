import _DijitWidget = require('dijit/form/Button');
import _FormWidget = require('./_FormWidget');

class Button extends _FormWidget {
	static _dijitConfig:any = {
		// _ButtonMixin
		label: 'string',
		type: 'string',
		onClick: { action: true },

		// Button
		showLabel: 'boolean',
		iconClass: 'string'
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

Button.configure(_FormWidget);

export = Button;
