import Widget = require('../Widget');

class DomWidget extends Widget {
	/* protected */ _node:HTMLElement;

	destroy():void {
		super.destroy();
		this._node.parentNode && this._node.parentNode.removeChild(this._node);
		this._node = null;
	}
}

export = DomWidget;
