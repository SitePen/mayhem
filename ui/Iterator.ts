/// <amd-dependency path="./renderer!Iterator" />

import array = require('dojo/_base/array');
import data = require('../data/interfaces');
import Mediator = require('../data/Mediator');
import ui = require('./interfaces');
import util = require('../util');
import WidgetFactory = require('../templating/WidgetFactory');
import View = require('./View');

var Renderer:any = require('./renderer!Iterator');

class Iterator extends View implements ui.IIterator {
	private _factory:WidgetFactory;
	private _listLength:number;
	private _mediatorIndex:{ [key:string]: Mediator; };
	private _sourceFieldHandle:IHandle;
	private _sourceObserverHandle:IHandle;
	/* protected */ _values:ui.IIteratorValues;
	private _widgetIndex:{ [key:string]: View; };

	constructor(kwArgs:any = {}) {
		util.deferSetters(this, [ 'source' ], '_render');
		this._mediatorIndex = {};
		this._widgetIndex = {};
		super(kwArgs);
	}

	get:ui.IIteratorGet;
	set:ui.IIteratorSet;

	private _createScopedMediator(key:string, mediator?:data.IMediator):Mediator {
		mediator || (mediator = this.get('mediator'));
		var scopedMediator:Mediator = new Mediator({ model: mediator }),
			_get = scopedMediator.get,
			_set = scopedMediator.set;
		scopedMediator.get = (field:string):any => {
			if (field !== this._values.each) {
				return _get.call(scopedMediator, field);
			}
			return this._getSourceKey(key);
		}
		scopedMediator.set = (field:string, value:any):void => {
			if (field !== this._values.each) {
				return _set.call(scopedMediator, field, value);
			}
			var oldValue:any = this._getSourceKey(key);
			this._setSourceKey(key, value);
			scopedMediator._notify(value, oldValue, this._values.each);
		};
		return scopedMediator;
	}

	destroy():void {
		this._sourceFieldHandle && this._sourceFieldHandle.remove();
		this._sourceObserverHandle && this._sourceObserverHandle.remove();
		this._sourceFieldHandle = this._sourceObserverHandle = null;
		this._impl.list.destroy();
		this.set({
			list: null,
			source: null
		});
		super.destroy();
	}

	private _eachSetter(value:string):void {
		this._values.each = value;
		var mediator:data.IMediator = this.get('mediator');
		if (!mediator) {
			return;
		}
		// Recreate our scoped mediators since the name of our value field changed
		array.forEach(util.getObjectKeys(this._widgetIndex), (key:string) => {
			var scoped = this._mediatorIndex[key] = this._createScopedMediator(key, mediator);
			this._widgetIndex[key].set('mediator', scoped);
		});
	}

	private _getSourceKey(key:any):any {
		var source:any = this.get('source');
		return source instanceof Array ? source[key] : source.get(key);
	}

	private _getMediatorByKey(key:any):Mediator {
		if (this._mediatorIndex[key]) {
			return this._mediatorIndex[key];
		}
		// Create and cache a new mediator that delegates to the old one
		return this._mediatorIndex[key] = this._createScopedMediator(key);
	}

	private _getWidgetByKey(key:any):View {
		var widget = this._widgetIndex[key];
		if (widget) {
			return widget;
		}
		var mediator = this._getMediatorByKey(key);
		widget = this._widgetIndex[key] = <View> this._factory.create();
		widget.set('mediator', mediator);
		this.attach(widget);
		return widget;
	}

	private _inSetter(value:string):void {
		// Tells us which field to use to get our source
		this._values['in'] = value;
		this._sourceFieldHandle && this._sourceFieldHandle.remove();
		this._sourceFieldHandle = this.bind({
			sourceBinding: value,
			targetBinding: 'source'
		});
	}

	private _setSourceKey(key:string, value:any):void {
		var source:any = this.get('source');
		if (source instanceof Array) {
			if (typeof source.set === 'function') {
				source.set(key, value);
			}
			else {
				source[key] = value;
				this.get('mediator').set(this.get('in'), (<any[]> []).concat(source));
			}
		}
		else {
			// source should be a dojo Store
			source.put(value[source.idProperty], value);
		}
	}

	private _sourceSetter(source:any):void {
		// Set up observer for new ObservableArray
		if (source !== this._values.source) {
			this._sourceObserverHandle && this._sourceObserverHandle.remove();
		}
		this._values.source = source;
		this._renderer.renderList(this);
		if (source instanceof Array) {
			// Resize and refresh the list
			var lastLength = this._listLength || 0,
				listLength = this._listLength = source.length;
			this._renderer.updateList(this, listLength - lastLength);
			// Add an observer if possible
			if (typeof source.observe === 'function') {
				this._sourceObserverHandle = source.observe((index:number, removals:any[], additions:any[]) => {
					this._renderer.updateList(this, additions.length - removals.length);
				});
			}
		}
		else {
			this._impl.list.set('store', source);
		}
	}

	private _templateSetter(value:any):void {
		// Set constructor since it comes in without one (to avoid being constructed during processing)
		// TODO: pass reference to constructor in options
		this._values.template = value;
		// TODO: reinstantiate and replace all widgets with new templates (reusing old mediators)
		this._factory = new WidgetFactory(value, View);
	}
}

Iterator.prototype._renderer = new Renderer();

export = Iterator;
