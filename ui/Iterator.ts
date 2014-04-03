/// <amd-dependency path="./renderer!Iterator" />

import array = require('dojo/_base/array');
import ContentView = require('./ContentView');
import data = require('../data/interfaces');
import has = require('../has');
import Mediator = require('../data/Mediator');
import Property = require('../data/Property');
import ui = require('./interfaces');
import util = require('../util');

var Renderer:any = require('./renderer!Iterator');

class ScopedMediator extends Mediator {
	static scope(mediator:data.IMediator, options:any = {}) {
		options.model = mediator;
		options.app = mediator.get('app');
		return new ScopedMediator(options);
	}
}

class Iterator extends ContentView implements ui.IIterator {
	/* protected */ _each:string;
	/* protected */ _mediatorIndex:{ [key:string]: Mediator; };
	/* protected */ _selectedItem:any;
	/* protected */ _widgetIndex:{ [key:string]: ui.IView; };

	constructor(kwArgs:any = {}) {
		this._deferProperty('source', '_render');
		this._mediatorIndex = {};
		this._widgetIndex = {};
		super(kwArgs);
	}

	get:ui.IIteratorGet;
	set:ui.IIteratorSet;

	private _createScopedMediator(key:string, mediator?:data.IMediator):Mediator {
		var view = this,
			scoped = ScopedMediator.scope(mediator || this.get('mediator')),
			valueProperty = new Property<any>({
				get: function ():any {
					return view._getSourceKey(key);
				},
				set: function (value:any):void {
					view._setSourceKey(key, value);
				}
			});

		// Replace _getProperties to take over property management
		scoped._getProperties = ():{ [key:string]:data.IProperty<any> } => {
			var properties = {};
			properties[view.get('each')] = valueProperty;
			return properties;
		}

		return scoped;
	}

	destroy():void {
		// Destroy derived widgets and mediators
		var widgets = this._widgetIndex,
			mediators = this._mediatorIndex;
		for (var i in widgets) {
			util.destroy(widgets[i]);
		}
		for (var j in mediators) {
			util.destroy(mediators[j]);
		}
		this._widgetIndex = this._mediatorIndex = widgets = mediators = null;

		super.destroy();
	}

	private _eachSetter(value:string):void {
		this._each = value;
		var mediator:data.IMediator = this.get('mediator');
		if (!mediator) {
			return;
		}
		debugger
		// Recreate our scoped mediators since the name of our value field changed
		array.forEach(util.getObjectKeys(this._widgetIndex), (key:string):void => {
			var scoped = this._mediatorIndex[key] = this._createScopedMediator(key, mediator);
			this._widgetIndex[key].set('mediator', scoped);
		});
	}

	private _getSourceKey(key:string):any {
		var source:any = this.get('source');
		if (source instanceof Array) {
			return source[key];
		}
		else if (source && source.get) {
			return source.get(key);
		}
	}

	/* protected */ _getMediatorByKey(key:string):Mediator {
		if (this._mediatorIndex[key]) {
			return this._mediatorIndex[key];
		}
		// Create and cache a new mediator that delegates to the old one
		return this._mediatorIndex[key] = this._createScopedMediator(key);
	}

	private _setSourceKey(key:string, value:any):void {
		var source:any = this.get('source');
		if (source instanceof Array) {
			// Use set method if available
			if (source.set) {
				source.set(key, value);
			}
			else {
				source[key] = value;
			}
		}
		else {
			// source should be a store, value should be a record
			//debugger
			value && source.put && source.put(value);
		}
	}
}

Iterator.prototype._renderer = new Renderer();

export = Iterator;
