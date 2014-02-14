/// <reference path="../../dijit" />

import array = require('dojo/_base/array');
import core = require('../../interfaces');
import SingleNodeWidget = require('./SingleNodeWidget');
import util = require('../../util');
import _WidgetBase = require('dijit/_WidgetBase');
import widgets = require('../interfaces');

/* abstract */ class DijitWidget extends SingleNodeWidget {
	/* protected */ _dijit:_WidgetBase;
	/* protected */ _dijitActions:string[];
	/* protected */ _dijitArgs:any;
	/* protected */ _dijitCtor:any; // new () => _WidgetBase;
	/* protected */ _dijitFields:string[];
	/* protected */ _disabled:boolean; // TODO: coerce string values coming from templates
	/* protected */ _firstNode:HTMLElement;
	/* protected */ _lastNode:HTMLElement;
	/* protected */ _parent:widgets.IContainerWidget;

	constructor(kwArgs:any = {}) {
		this._setDijitFields('disabled', 'iconClass', 'label');

		// Build up dijit kwArgs and methods from the fields provided
		var dijitArgs:any = this._dijitArgs = {};
		array.forEach(this._dijitFields || [], (field:string) => {
			if (field in kwArgs) {
				dijitArgs[field] = kwArgs[field];
			}
			this['_' + field + 'Setter'] = (value:any):void => {
				this['_' + field] = value;
				this._dijit && this._dijit.set(field, value);
			};
		});
		// We need to do something slightly different for actions
		array.forEach(this._dijitActions || [], (field:string) => {
			var action = (e:Event):boolean => {
				var mediator:core.IMediator = this.get('mediator');
				var method:string = this['_' + field];
				console.log('action called:', field, '-- mediator method:', method)
				return mediator[method] ? mediator[method](e) : true;
			};
			if (field in kwArgs) {
				dijitArgs[field] = action;
			}
			this['_' + field + 'Setter'] = (method:any):void => {
				this['_' + field] = method;
				this._dijit && this._dijit.set(field, action);
			};
		});

		// Prevent id attribute from being passed through to widgets
		dijitArgs.id = kwArgs.id;
		delete kwArgs.id;

		super(kwArgs);
	}

	destroy():void {
		if (this._dijit) {
			this._dijit.destroyRecursive();
			this._dijit = null;
		}
		super.destroy();
	}

	/* protected */ _parentSetter(parent:widgets.IContainerWidget):void {
		this._parent = parent;
		if (document.documentElement.contains(this._firstNode)) {
			this._dijit.startup();
		}
		// TODO: otherwise, we need to start when the parent starts, whenever that is, whatever that means
		super._parentSetter(parent);
	}

	/* protected */ _render():void {
		var dijit:_WidgetBase = new this._dijitCtor(this._dijitArgs);
		this.get('classList').set(dijit.domNode.className);
		this._firstNode = this._lastNode = dijit.domNode;
		this.set('dijit', dijit);
	}

	/* protected */ _setDijitActions(...keys:string[]):void {
		this._dijitActions = (this._dijitActions || []).concat(keys);
	}

	/* protected */ _setDijitCtor(ctor:any):void {
		// TODO: this should really be a default property definition but typescript fails here
		// First Ctor wins
		this._dijitCtor || (this._dijitCtor = ctor);
	}

	/* protected */ _setDijitFields(...keys:string[]):void {
		this._dijitFields = (this._dijitFields || []).concat(keys);
	}
}

export = DijitWidget;
