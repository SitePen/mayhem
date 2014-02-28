import _DijitWidget = require('dijit/layout/LayoutContainer');
import _LayoutWidget = require('./_LayoutWidget');

class LayoutContainer extends _LayoutWidget {
	static _childDijitConfig:any = {
		region: 'string',
		layoutPriority: 'number'
	};
	static _dijitConfig:any = {
		design: 'string' // TODO enum: headline, sidebar
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

LayoutContainer.configureLayout(_LayoutWidget);

export = LayoutContainer;
