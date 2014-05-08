/// <reference path="../dojo" />
/// <amd-dependency path="./renderer!Iterator" />

import array = require('dojo/_base/array');
import ContentView = require('./ContentView');
import data = require('../data/interfaces');
import has = require('../has');
import Mediator = require('../data/Mediator');
import Property = require('../data/Property');
import ui = require('./interfaces');
import util = require('../util');
import when = require('dojo/when');

var Renderer:any = require('./renderer!Iterator');

class ScopedMediator extends Mediator {
	static scope(model:data.IMediator, options:any = {}):ScopedMediator {
		options.model = model;
		options.app = model.get('app');
		return new ScopedMediator(options);
	}
}

class Iterator extends ContentView implements ui.IIterator {
	/* protected */ _each:string;
	/* protected */ _selectedItem:any;
	/* protected */ _viewIndex:{ [key:string]: ui.IView; };
	/* protected */ _viewModelIndex:{ [key:string]: Mediator; };

	constructor(kwArgs:any = {}) {
		this._deferProperty('source', '_render');
		this._viewIndex = {};
		this._viewModelIndex = {};
		super(kwArgs);
	}

	get:ui.IIteratorGet;
	set:ui.IIteratorSet;

	private _createScopedMediator(key:string, model?:data.IMediator):Mediator {
		var view = this,
			scoped = ScopedMediator.scope(model || this.get('model')),
			itemProperty = new Property<any>({
				get: function ():any {
					return view._getSourceItem(key);
				},
				set: function (value:any):void {
					when(value, (value:any):void => {
						this._value = value;
						view._setSourceItem(key, value);
					});
				},
				dependencies: [ 'model' ]
			});

		// Replace _getProperties to take over property management
		scoped._getProperties = ():{ [key:string]:data.IProperty<any> } => {
			var properties = {};
			properties[view.get('each')] = itemProperty;
			return properties;
		};

		return scoped;
	}

	destroy():void {
		// Destroy derived views and view models
		var views = this._viewIndex,
			viewModels = this._viewModelIndex;
		for (var i in views) {
			util.destroy(views[i]);
		}
		for (var j in viewModels) {
			util.destroy(viewModels[j]);
		}
		this._viewIndex = this._viewModelIndex = views = viewModels = null;

		super.destroy();
	}

	private _eachChanged(value:string):void {
		var model:data.IMediator = this.get('model');
		if (!model) {
			return;
		}

		// Recreate our scoped models since the name of our value field changed
		array.forEach(util.getObjectKeys(this._viewIndex), (key:string):void => {
			var scoped = this._viewModelIndex[key] = this._createScopedMediator(key, model);
			this._viewIndex[key].set('model', scoped);
		});
	}

	private _getSourceItem(key:string):any {
		var source:any = this.get('source');
		if (source instanceof Array) {
			return source[key];
		}
		else if (source && source.get) {
			return source.get(key);
		}
	}

	/* protected */ _getViewModelByKey(key:string):Mediator {
		if (this._viewModelIndex[key]) {
			return this._viewModelIndex[key];
		}
		// Create and cache a new mediator that delegates to the old one
		return this._viewModelIndex[key] = this._createScopedMediator(key);
	}

	private _setSourceItem(key:string, value:any):void {
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
			// debugger
			value && source.put && source.put(value);
		}
	}
}

Iterator.prototype._renderer = new Renderer();

export = Iterator;
