import _DijitWidget = require('dijit/form/TextBox');
import _FormValueWidget = require('./_FormValueWidget');
import util = require('../../../util');

class TextBox extends _FormValueWidget {
	static _dijitConfig:any = {
		// _TextBoxMixin
		trim: 'boolean',
		uppercase: 'boolean',
		lowercase: 'boolean',
		propercase: 'boolean',
		maxLength: 'string',
		selectOnClick: 'boolean',
		placeHolder: 'string',
		onInput: { action: true }
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;

	/* protected */ _render():void {
		this._dijitArgs.intermediateChanges = true;
		super._render();
	}
}

TextBox.configure(_FormValueWidget);

export = TextBox;
