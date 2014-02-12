/// <reference path="../../dijit" />

import SingleNodeWidget = require('./SingleNodeWidget');
import util = require('../../util');
import _WidgetBase = require('dijit/_WidgetBase');
import widgets = require('../interfaces');

/* abstract */ class DijitWidget extends SingleNodeWidget {
	/* protected */ _dijit:_WidgetBase;
	/* protected */ _dijitId:string;
	/* protected */ _disabled:boolean; // TODO: coerce string values coming from templates
	/* protected */ _firstNode:HTMLElement;
	/* protected */ _lastNode:HTMLElement;
	/* protected */ _parent:widgets.IContainerWidget;

	constructor(kwArgs?:Object) {
		this._dijitId = kwArgs.id;
		delete kwArgs.id;
		util.deferSetters(this, [ 'disabled', 'parent' ], '_render');
		super(kwArgs);
	}

	_disabledSetter(disabled:boolean):void {
		this._disabled = disabled;
		this._dijit.set('disabled', disabled);
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
