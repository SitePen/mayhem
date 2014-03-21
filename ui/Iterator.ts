/// <amd-dependency path="./renderer!Iterator" />

import array = require('dojo/_base/array');
import data = require('../data/interfaces');
import Mediator = require('../data/Mediator');
import ui = require('./interfaces');
import util = require('../util');
import View = require('./View');

var Renderer:any = require('./renderer!Iterator');

class Iterator extends View implements ui.IIterator {
	/* protected */ _factory:any; // WidgetFactory, but should be `typeof View` instead
	/* protected */ _mediatorIndex:{ [key:string]: Mediator; };
	private _sourceBinding:IHandle;
	/* protected */ _values:ui.IIteratorValues;
	/* protected */ _widgetIndex:{ [key:string]: ui.IMediated; };

	constructor(kwArgs:any = {}) {
		util.deferSetters(this, [ 'source' ], '_render');
		this._mediatorIndex = {};
		this._widgetIndex = {};
		super(kwArgs);
	}

	get:ui.IIteratorGet;
	set:ui.IIteratorSet;

	/* protected */ _createScopedMediator(key:string, mediator?:data.IMediator):Mediator {
		mediator || (mediator = this.get('mediator'));
		var scopedMediator:Mediator = new Mediator({ model: mediator }),
			_get = scopedMediator.get,
			_set = scopedMediator.set;
		scopedMediator.get = (name:string):any => {
			if (name !== this._values.each) {
				return _get.call(scopedMediator, name);
			}
			return this._getSourceKey(key);
		}
		scopedMediator.set = <data.IMediatorSet> ((name:string, value:any):void => {
			if (name !== this._values.each) {
				return _set.call(scopedMediator, name, value);
			}
			var oldValue:any = this._getSourceKey(key);
			this._setSourceKey(key, value);
			scopedMediator._notify(value, oldValue, this._values.each);
		});
		return scopedMediator;
	}

	destroy():void {
		this._sourceBinding && this._sourceBinding.remove();
		this._sourceBinding = null;
		// TODO: tear down derived widgets and mediators
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

	private _getSourceKey(key:string):any {
		var source:any = this.get('source');
		return source instanceof Array ? source[key] : source.get(key);
	}

	private _getMediatorByKey(key:string):Mediator {
		if (this._mediatorIndex[key]) {
			return this._mediatorIndex[key];
		}
		// Create and cache a new mediator that delegates to the old one
		return this._mediatorIndex[key] = this._createScopedMediator(key);
	}

	getWidgetByKey(key:string):ui.IMediated {
		var widget = this._widgetIndex[key];
		if (widget) {
			return widget;
		}
		var mediator = this._getMediatorByKey(key);
		widget = this._widgetIndex[key] = <ui.IMediated> this._factory.create();
		widget.set('mediator', mediator);
		this.attach(widget);
		return widget;
	}

	private _inSetter(value:string):void {
		// Tells us which field to use to get our source
		this._values['in'] = value;
		this._sourceBinding && this._sourceBinding.remove();
		this._sourceBinding = this.bind({
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
}

Iterator.prototype._renderer = new Renderer();

export = Iterator;
