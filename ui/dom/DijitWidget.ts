/// <reference path="../../dijit" />

import SingleNodeWidget = require('./SingleNodeWidget');
import util = require('../../util');
import _WidgetBase = require('dijit/_WidgetBase');
import widgets = require('../interfaces');

/* abstract */ class DijitWidget extends SingleNodeWidget {
	/* protected */ _dijit:_WidgetBase;
	firstNode:HTMLElement;
	lastNode:HTMLElement;

	constructor(kwArgs:Object = {}) {
		util.deferSetters(this, [ 'parent' ], '_render');
		super(kwArgs);
	}

	destroy():void {
		this._dijit && this._dijit.destroyRecursive();
		this._dijit = null;
		super.destroy();
	}

	/* protected */ _parentSetter(value:widgets.IContainerWidget):void {
		this.parent = value;
		if (document.documentElement.contains(this.firstNode)) {
			this._dijit.startup();
		}
		// TODO: otherwise, we need to start when the parent starts, whenever that is, whatever that means
	}

	/* protected */ _render():void {
		this.classList.set(this._dijit.domNode.className);
		this.firstNode = this.lastNode = this._dijit.domNode;
	}
}

export = DijitWidget;
