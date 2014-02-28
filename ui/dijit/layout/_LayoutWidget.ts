import lang = require('dojo/_base/lang');
import _Widget = require('../_Widget');
import _Dijit = require('../_Dijit');

class _LayoutWidget extends _Widget { // TODO: implements _Container, _Contained
	static _childDijitConfig:any = {};

	// TODO: figure out how to do this by overloading configure
	static configureLayout(BaseClass:typeof _LayoutWidget) {
		// Add class child config to base defaults before deferring to super class configure
		lang.mixin(_Dijit._dijitConfigDefault, this._childDijitConfig);
		this.configure(BaseClass);
	}
}

_LayoutWidget.configure(_Widget);

export = _LayoutWidget;
