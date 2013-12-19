import Widget = require('../Widget');

class DomWidget extends Widget {
	// The node needs to be publicly accessible because container widgets have to interact with it directly in order
	// to place the widget. It is marked with underscore to indicate users should not use it
	_node:HTMLElement;

	destroy():void {
		super.destroy();
		this._node.parentNode && this._node.parentNode.removeChild(this._node);
		this._node = null;
	}
}

export = DomWidget;
