import Widget = require('./Widget');

class SingleNodeWidget extends Widget {
	/**
	 * @protected
	 */
	_node:Element;

	detach():Element {
		this._node.parentNode && this._node.parentNode.removeChild(this._node);
		super.detach();
		return this._node;
	}

	_firstNodeGetter():Element {
		return this._node;
	}

	_lastNodeGetter():Element {
		return this._node;
	}
}

module SingleNodeWidget {
	export interface Events extends Widget.Events {}
	export interface Getters extends Widget.Getters {
		(key:'firstNode'):Element;
		(key:'lastNode'):Element;
	}
	export interface Setters extends Widget.Setters {}
}

export = SingleNodeWidget;
