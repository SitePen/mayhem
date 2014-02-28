import StackContainer = require('./StackContainer');

class _TabContainerBase extends StackContainer {
	static _dijitConfig:any = {
		tabPosition: 'string',
		tabStrip: 'boolean',
		nested: 'boolean'
	};
}

_TabContainerBase.configureLayout(StackContainer);

export = _TabContainerBase;
