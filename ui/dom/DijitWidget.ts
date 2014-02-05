/// <reference path="../../dijit" />

import SingleNodeWidget = require('./SingleNodeWidget');
import util = require('../../util');
import _WidgetBase = require('dijit/_WidgetBase');
import widgets = require('../interfaces');

/* abstract */ class DijitWidget extends SingleNodeWidget {
	/* protected */ _dijit:_WidgetBase;
	/* protected */ _firstNode:HTMLElement;
	/* protected */ _lastNode:HTMLElement;
	/* protected */ _parent:widgets.IContainerWidget;

	constructor(kwArgs?:Object) {
		util.deferSetters(this, [ 'parent' ], '_render');
		super(kwArgs);
	}

	destroy():void {
		if (this._dijit) {
			this._dijit.destroyRecursive();
			this._dijit = null;
		}

		super.destroy();
	}

	/* protected */ _parentSetter(value:widgets.IContainerWidget):void {
		this._parent = value;
		if (document.documentElement.contains(this._firstNode)) {
			this._dijit.startup();
		}
		// TODO: otherwise, we need to start when the parent starts, whenever that is, whatever that means
	}

	/* protected */ _render():void {
		this.get('classList').set(this._dijit.domNode.className);
		this._firstNode = this._lastNode = this._dijit.domNode;
	}
}

export = DijitWidget;
