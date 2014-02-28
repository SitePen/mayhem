import _DijitWidget = require('dijit/MenuSeparator');
import _WidgetBase = require('./_WidgetBase');

class MenuSeparator extends _WidgetBase {
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

MenuSeparator.configure(_WidgetBase);

export = MenuSeparator;
