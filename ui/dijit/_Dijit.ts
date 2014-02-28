/// <reference path="../../dijit" />
/// <reference path="../../dojo" />

import core = require('../../interfaces');
import domConstruct = require('dojo/dom-construct');
import has = require('../../has');
import lang = require('dojo/_base/lang');
import PlacePosition = require('../PlacePosition');
import ui = require('../interfaces');
import util = require('../../util');
import ViewWidget = require('../dom/ViewWidget');
import __WidgetBase = require('dijit/_WidgetBase');

/* abstract */ class _Dijit extends ViewWidget { // TODO: extend a content-aware ElementWidget instead
	// TODO: finish cataloging dijit fields
	static _dijitConfig:any = {};
	static _dijitConfigDefault:any = {
		lang: 'string',
		dir: 'string',
		'class': 'string',
		style: 'string',
		title: 'string',
		tooltip: 'string'
	};

	static _DijitWidget:typeof __WidgetBase;

	static configure(BaseClass:typeof _Dijit):void {
		lang.mixin(this._dijitConfig, BaseClass._dijitConfig);
		this._dijitConfig = lang.delegate(this._dijitConfigDefault, this._dijitConfig);
	}

	/* protected */ _children:_Dijit[];
	/* protected */ _dijit:__WidgetBase;
	/* protected */ _dijitArgs:any;
	/* protected */ _dijitRequiredFields:string[];

	constructor(kwArgs:any = {}) {
		var dijitArgs:any = this._dijitArgs = {};
		if ('id' in kwArgs) {
			dijitArgs.id = kwArgs.id;
		}

		this._dijitRequiredFields = [];
		var config:any = (<any> this.constructor)._dijitConfig;
		for (var field in config) {
			if (config[field]) {
				this._configureDijitField(field, config[field], kwArgs);
			}
		}
		super(kwArgs);
	}

	// TODO: Container
	add(widget:ui.IDomWidget, position:any = PlacePosition.LAST):IHandle {
		// We only support adding children to dijits by index for now
		if (!(widget instanceof _Dijit)) {
			throw new Error('Only Dijit instances can be added to Dijit container');
		}
		position || (position = 0);
		if (typeof position === 'number' && position >= 0) {
			widget.set('parent', this);
			this.get('children')[position] = widget;
			this._dijit.addChild((<_Dijit> widget)._dijit, position);
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

	private _bindDijitAction(key:string):(e:Event) => boolean {
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

	private _bindDijitChild(key:string):void {
		this['_' + key + 'Setter'] = (value:any):void => {
			this['_' + key] = value;
			this._dijit && this._dijit.set(key, value._dijit);
		};
	}

	private _bindDijitProperty(key:string):void {
		this['_' + key + 'Setter'] = (value:any):void => {
			this['_' + key] = value;
			this._dijit && this._dijit.set(key, value);
		};
	}

	clear():void {
		this._dijit.containerNode.innerHTML = '';
	}

	/* protected */ _configureDijitField(field:string, descriptor:any, kwArgs?:any):void {
		// If kwArgs are passed it means we haven't constructed yet
		if (!kwArgs) {
			throw new Error('NYI')
		}
		if (descriptor.required) {
			this._dijitRequiredFields.push(field);
		}
		if (descriptor.action) {
			var action:(e:Event) => boolean = this._bindDijitAction(field);
			if (field in kwArgs) {
				this._dijitArgs[field] = action;
			}
		}
		else if (descriptor.child) {
			this._bindDijitChild(field);
			if (field in kwArgs) {
				this._dijitArgs[field] = kwArgs[field]._dijit;
			}
			// TODO: check if rendered
			util.deferSetters(this, [ field ], '_render');
		}
		else {
			this._bindDijitProperty(field);
			if (field in kwArgs) {
				this._dijitArgs[field] = kwArgs[field];
			}
		}
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
		var dijit:__WidgetBase = new (<any> this.constructor)._DijitWidget(this._dijitArgs);
		this.get('classList').set(dijit.domNode.className);
		this._lastNode.parentNode.insertBefore(dijit.domNode, this._lastNode);
		this.set('dijit', dijit);
	}

	/* protected */ _startup():void {
		// Verify all required fields before starting up
		var fields:string[] = this._dijitRequiredFields,
			field:string;
		for (var i = 0; (field = fields[i]); ++i) {
			if (!this['_' + field]) {
				throw new Error('Dijit widget requires `' + field + '` property');
			}
		}
		this._dijit.startup();
	}
}

export = _Dijit;
