/// <reference path="../../dijit" />
/// <reference path="../../dojo" />

import array = require('dojo/_base/array');
import core = require('../../interfaces');
import domConstruct = require('dojo/dom-construct');
import has = require('../../has');
import PlacePosition = require('../PlacePosition');
import ui = require('../interfaces');
import util = require('../../util');
import ViewWidget = require('../dom/ViewWidget');
import _WidgetBase = require('dijit/_WidgetBase');

/* abstract */ class Dijit extends ViewWidget { // TODO: extend a content-aware ElementWidget instead
	/* protected */ _children:Dijit[];
	/* protected */ _dijit:_WidgetBase;
	/* protected */ _dijitActions:string[];
	/* protected */ _dijitArgs:any;
	/* protected */ _DijitCtor:{ new (kwArgs?:any):_WidgetBase; };
	/* protected */ _dijitFields:string[];
	/* protected */ _dijitRequiredFields:string[];
	/* protected */ _dijitWidgetFields:string[];

	constructor(kwArgs:any = {}) {
		var dijitArgs:any = this._dijitArgs = {};
		if ('id' in kwArgs) {
			dijitArgs.id = kwArgs.id;
		}

		array.forEach(this._allInheritedItems('_dijitFields'), (key:string) => {
			this._initializeDijitField(key);
			if (key in kwArgs) {
				dijitArgs[key] = kwArgs[key];
			}
		});

		var widgetFields:string[] = this._allInheritedItems('_dijitWidgetFields');
		array.forEach(widgetFields, (key:string) => {
			this._initializeDijitWidgetField(key);
			if (key in kwArgs) {
				dijitArgs[key] = kwArgs[key]._dijit;
			}
		});
		util.deferSetters(this, widgetFields, '_render');

		array.forEach(this._allInheritedItems('_dijitActions'), (key:string) => {
			var action:(e:Event) => boolean = this._initializeDijitAction(key);
			if (key in kwArgs) {
				dijitArgs[key] = action;
			}
		});
		super(kwArgs);
	}

	// TODO: DijitContainer
	add(widget:ui.IDomWidget, position:any = PlacePosition.LAST):IHandle {
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

	// Helper to walk prototype property and build up a set of all string[] values
	private _allInheritedItems(key:string):string[] {
		var target = this,
			items:string[] = [],
			values:any;
		while (target) {
			if (target.hasOwnProperty(key)) {
				values = target[key];
				for (var i = 0, len = values.length; i < len; ++i) {
					items.indexOf(values[i]) < 0 && items.push(values[i]);
				}
			}
			if (target.constructor === Dijit) {
				return items;
			}
			target = target.__proto__; // FIXME
		}
		return items;
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

	private _initializeDijitAction(key:string):(e:Event) => boolean {
		var action = (e:Event):boolean => {
			var mediator:core.IMediator = this.get('mediator');
			var method:string = this['_' + key];
			console.log('action called:', key, '-- mediator method:', method)
			return mediator[method] ? mediator[method](e) : true;
		};
		this['_' + key + 'Setter'] = (method:any):void => {
			this['_' + key] = method;
			this._dijit && this._dijit.set(key, action);
		};
		return action;
	}

	private _initializeDijitWidgetField(key:string):void {
		this['_' + key + 'Setter'] = (value:any):void => {
			this['_' + key] = value;
			this._dijit && this._dijit.set(key, value._dijit);
		};
	}

	private _initializeDijitField(key:string):void {
		this['_' + key + 'Setter'] = (value:any):void => {
			this['_' + key] = value;
			this._dijit && this._dijit.set(key, value);
		};
	}

	/* protected */ _placeContent():void {
		this.clear();
		var container = this._dijit.containerNode; // TODO: or this._dijit.domNode?
		container.appendChild(this._content);
	}

	/* protected */ _render():void {
		super._render();
		var dijit:_WidgetBase = new this._DijitCtor(this._dijitArgs);
		this.get('classList').set(dijit.domNode.className);
		this._lastNode.parentNode.insertBefore(dijit.domNode, this._lastNode);
		this.set('dijit', dijit);
	}

	/* protected */ _startup():void {
		if (this._dijit._started) {
			return;
		}
		// Verify all required fields before starting up
		var fields:string[] = this._allInheritedItems('_dijitRequiredFields'),
			field:string;
		for (var i = 0; (field = fields[i]); ++i) {
			if (!this[field]) {
				throw new Error('Dijit requires `' + field + '` property');
			}
		}
		this._dijit.startup();
	}
}

// TODO: properly catalog dijit fields
Dijit.prototype._dijitFields = [ 'disabled', 'iconClass', 'label', 'region', 'splitter', 'style', 'title', 'tooltip' ];

export = Dijit;
