/// <reference path="../../dijit" />
/// <reference path="../../dojo" />

import array = require('dojo/_base/array');
import ContentWidget = require('../dom/ContentWidget');
import core = require('../../interfaces');
import domConstruct = require('dojo/dom-construct');
import has = require('../../has');
import PlacePosition = require('../PlacePosition');
import ui = require('../interfaces');
import util = require('../../util');
import ViewWidget = require('../dom/ViewWidget');
import __WidgetBase = require('dijit/_WidgetBase');

/* abstract */ class Dijit extends ViewWidget { // TODO: extend a content-aware ElementWidget instead
	/* protected */ _children:Dijit[];
	/* protected */ _dijit:__WidgetBase;
	/* protected */ _dijitActions:string[];
	/* protected */ _dijitArgs:any;
	/* protected */ _dijitCtor:any; // new () => __WidgetBase;
	/* protected */ _dijitFields:string[];

	constructor(kwArgs:any = {}) {
		// TODO: this is a hack and needs cleanup
		this._setDijitFields('disabled', 'iconClass', 'label', 'region', 'splitter', 'style', 'title', 'tooltip');

		// Build up dijit kwArgs and methods from the fields provided
		var dijitArgs:any = this._dijitArgs = {};
		if ('id' in kwArgs) {
			dijitArgs.id = kwArgs.id;
		}

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

		super(kwArgs);
	}

	add(widget:ui.IDomWidget, position:any = PlacePosition.LAST):IHandle {
		// TODO: create a distinctino for DijitContainers
		// We only support adding children to dijits by index for now
		if (!(widget instanceof Dijit)) {
			throw new Error('Only Dijit instances can be added to DijitContainer');
		}
		position || (position = 0);
		if (typeof position === 'number' && position >= 0) {
			widget.set('parent', this);
			this.get('children')[position] = widget;
			this._dijit.addChild((<Dijit> widget)._dijit, position);
			return; // TODO: IHandle
		}
		if (has('debug')) {
			throw new Error('NYI');
		}
	}

	/* protected */ _attachedSetter(attached:boolean):void {
		if (attached) {
			this._startup();
		}
		super._attachedSetter(attached);
	}

	clear():void {
		this._dijit.containerNode.innerHTML = '';
	}

	destroy():void {
		if (this._dijit) {
			this._dijit.destroyRecursive();
			this._dijit = null;
		}
		super.destroy();
	}

	/* protected */ _placeContent():void {
		this.clear();
		var container = this._dijit.containerNode; // TODO: or this._dijit.domNode?
		container.appendChild(this._content);
	}

	/* protected */ _render():void {
		super._render();
		var dijit:__WidgetBase = new this._dijitCtor(this._dijitArgs);
		this.get('classList').set(dijit.domNode.className);
		this._lastNode.parentNode.insertBefore(dijit.domNode, this._lastNode);
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

	/* protected */ _startup():void {
		this._dijit.startup();
	}
}

export = Dijit;
