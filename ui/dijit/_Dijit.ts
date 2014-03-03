/// <reference path="../../dojo" />
/// <reference path="../../dijit" />

import ContentWidget = require('../dom/ContentWidget');
import core = require('../../interfaces');
import dijit = require('interfaces');
import domConstruct = require('dojo/dom-construct');
import lang = require('dojo/_base/lang');
import PlacePosition = require('../PlacePosition');
import ui = require('../interfaces');
import util = require('../../util');
import _WidgetBase = require('dijit/_WidgetBase');

/* abstract */ class _Dijit extends ContentWidget {
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

	static _DijitWidget:typeof _WidgetBase;

	static configure(BaseClass:typeof _Dijit):void {
		lang.mixin(this._dijitConfig, BaseClass._dijitConfig);
		this._dijitConfig = lang.delegate(this._dijitConfigDefault, this._dijitConfig);
	}

	/* protected */ _children:_Dijit[];
	/* protected */ _dijit:dijit.IWidgetBase;
	/* protected */ _dijitArgs:any;
	/* protected */ _dijitRequiredFields:string[];
	private _dijitWatchHandles:IHandle[];
	private _renderHandle:IHandle;

	constructor(kwArgs:any = {}) {
		this.initialize(kwArgs);
		super(kwArgs);
	}

	/* protected */ _attachedSetter(attached:boolean):void {
		if (attached) {
			this._startup();
		}
		super._attachedSetter(attached);
	}

	clear():void {
		this._dijit.domNode.innerHTML = '';
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
			var action:(e:Event) => boolean = this._createDijitAction(field);
			if (field in kwArgs) {
				this._dijitArgs[field] = action;
			}
		}
		else if (descriptor.child) {
			this._createDijitChild(field);
			if (field in kwArgs) {
				this._dijitArgs[field] = kwArgs[field]._dijit;
			}
		}
		else {
			this._createDijitProperty(field);
			if (field in kwArgs) {
				this._dijitArgs[field] = kwArgs[field];
			}
		}
		util.deferSetters(this, [ field ], '_render');
	}

	private _createDijitAction(key:string):(e:Event) => boolean {
		var action = (e:Event):boolean => {
			var mediator:core.IMediator = this.get('mediator');
			var method:string = this['_' + key];
			console.log('action called:', key, '-- mediator method:', method)
			return mediator[method] ? mediator[method](e) : true;
		};
		this['_' + key + 'Setter'] = (method:any):void => {
			this['_' + key] = method;
			this._dijit.set(key, action);
		};
		return action;
	}

	private _createDijitChild(key:string):void {
		this['_' + key + 'Setter'] = (value:any):void => {
			this['_' + key] = value;
			this._dijit.set(key, value._dijit);
		};
	}

	private _createDijitProperty(key:string):void {
		this['_' + key + 'Setter'] = (value:any):void => {
			this['_' + key] = value;
			this._dijit.set(key, value);
		};
		this._renderHandle = this.on('render', () => {
			this._dijitWatchHandles.push(this._dijit.watch(key, (key:any, last:any, value:any):void => {
				this.set(key, value);
			}));
			// TODO: allow a debounce rate to be specified
		});
	}

	destroy():void {
		this._renderHandle && this._renderHandle.remove();
		util.destroyHandles(this._dijitWatchHandles);
		this._renderHandle = this._dijitWatchHandles = null;
		if (this._dijit) {
			this._dijit.destroyRecursive();
			this._dijit = null;
		}
		super.destroy();
	}

	initialize(kwArgs:any):void {
		this._dijitRequiredFields = [];
		this._dijitWatchHandles = [];

		var dijitArgs:any = this._dijitArgs = {};
		if ('id' in kwArgs) {
			dijitArgs.id = kwArgs.id;
		}
		var config:any = (<any> this.constructor)._dijitConfig;
		for (var field in config) {
			if (config[field]) {
				this._configureDijitField(field, config[field], kwArgs);
			}
		}
	}

	/* protected */ _render():void {
		super._render();
		var dijit:dijit.IWidgetBase = new (<any> this.constructor)._DijitWidget(this._dijitArgs);
		this.get('classList').set(dijit.domNode.className);
		//this._lastNode.parentNode.insertBefore(dijit.domNode, this._lastNode);

		this._firstNode = this._lastNode = dijit.domNode;
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
