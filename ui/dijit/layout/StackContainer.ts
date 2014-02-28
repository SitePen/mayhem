import _DijitWidget = require('dijit/layout/StackContainer');
import _LayoutWidget = require('./_LayoutWidget');

class StackContainer extends _LayoutWidget {
	static _childDijitConfig:any = {
		selected: 'boolean',
		disabled: 'boolean',
		closable: 'boolean',
		iconClass: 'string',
		showTitle: 'boolean'
	}
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

StackContainer.configureLayout(_LayoutWidget);

export = StackContainer;
