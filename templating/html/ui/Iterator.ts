/// <reference path="../../../dgrid" />
/// <reference path="../../../dojo" />

import array = require('dojo/_base/array');
import core = require('../../../interfaces');
import WidgetFactory = require('../../WidgetFactory');
import Element = require('../../../ui/Element');
import lang = require('dojo/_base/lang');
import List = require('dgrid/List');
import Mediator = require('../../../Mediator');
import OnDemandList = require('dgrid/OnDemandList');
import util = require('../../../util');

class Iterator extends Element {
	private _factory:WidgetFactory;
	private _list:List;
	private _listLength:number;
	private _mediatorIndex:{ [key:string]: Mediator; };
	private _scopedField:string;
	private _sourceField:string;
	private _sourceFieldHandle:IHandle;
	private _sourceObserverHandle:IHandle;
	private _source:any; // Array | ObservableArray | IStore<any>
	private _template:any;
	private _WidgetCtor:typeof Element;
	private _widgetIndex:{ [key:string]: Element; };

	constructor(kwArgs:Object) {
		util.deferSetters(this, [ 'source' ], '_render');
		this._mediatorIndex = {};
		this._widgetIndex = {};
		this._WidgetCtor = Element;
		super(kwArgs);
	}

	private _createScopedMediator(key:string, mediator?:core.IMediator):Mediator {
		mediator || (mediator = this.get('mediator'));
		var scopedMediator:Mediator = new Mediator({ model: mediator }),
			_get = scopedMediator.get,
			_set = scopedMediator.set;
		scopedMediator.get = (field:string):any => {
			if (field !== this._scopedField) {
				return _get.call(scopedMediator, field);
			}
			return this._getSourceKey(key);
		}
		scopedMediator.set = (field:string, value:any):void => {
			if (field !== this._scopedField) {
				return _set.call(scopedMediator, field, value);
			}
			var oldValue:any = this._getSourceKey(key);
			this._setSourceKey(key, value);
			scopedMediator._notify(value, oldValue, this._scopedField);
		};
		return scopedMediator;
	}

	destroy():void {
		this._list.destroy();
		this._list = this._source = null;
		this._sourceFieldHandle && this._sourceFieldHandle.remove();
		this._sourceObserverHandle && this._sourceObserverHandle.remove();
		this._sourceFieldHandle = this._sourceObserverHandle = null;
		super.destroy();
	}

	private _eachSetter(scopedField:string):void {
		this._scopedField = scopedField;
		var mediator = this.get('mediator');
		if (!mediator) {
			return;
		}
		// Recreate our scoped mediators since the name of our value field changed
		array.forEach(util.getObjectKeys(this._widgetIndex), (key:string) => {
			var scoped:Mediator = this._mediatorIndex[key] = this._createScopedMediator(key, mediator);
			this._widgetIndex[key].set('mediator', scoped);
		});
	}

	private _getSourceKey(key:any):any {
		var source:any = this._source;
		return source instanceof Array ? source[key] : source.get(key);
	}

	private _getMediatorByKey(key:any):Mediator {
		if (this._mediatorIndex[key]) {
			return this._mediatorIndex[key];
		}
		// Create and cache a new mediator that delegates to the old one
		return this._mediatorIndex[key] = this._createScopedMediator(key);
	}

	private _getWidgetByKey(key:any):Element {
		var widget = this._widgetIndex[key];
		if (widget) {
			return widget;
		}
		var mediator = this._getMediatorByKey(key);
		widget = this._widgetIndex[key] = <Element> this._factory.create();
		widget.set('mediator', mediator);
		this.attach(widget);
		return widget;
	}

	private _inSetter(sourceField:string):void {
		// Tells us which field to use to get our source
		this._sourceField = sourceField;
		this._sourceFieldHandle && this._sourceFieldHandle.remove();
		this._sourceFieldHandle = this.bind({
			sourceBinding: sourceField,
			targetBinding: 'source'
		});
	}

	private _renderList():void {
		var list = this._list,
			source = this._source;

		// Clean up list and detach all widgets
		array.forEach(util.getObjectKeys(this._widgetIndex), (key:string) => {
			this._widgetIndex[key].detach();
		});
		list && list.destroy();
		if (source instanceof Array) {
			list = this._list = new List();
			var _insertRow:any = list.insertRow;
			list.insertRow = (object:any, parent:any, beforeNode:Node, i:number, options?:any):HTMLElement => {
				var widget = this._getWidgetByKey(i);
				widget.detach();
				return _insertRow.call(list, widget.get('fragment'), parent, beforeNode, i, options);
			};
			list.renderRow = (element) => element;
		}
		else {
			list = this._list = new OnDemandList();
			list.renderRow = (record:any):HTMLElement => {
				var widget:Element = this._getWidgetByKey(record[source.idProperty]);
				return <HTMLElement> widget.get('fragment');
			};
		}
		list.set('showHeader', false);
		this._renderer.render(this, { fragment: list.domNode });
		// TODO: parameterize
		source instanceof Array && this.get('classList').add('autoheight');
	}

	private _setSourceKey(key:string, value:any):void {
		var source:any = this._source,
			oldValue:any = this._getSourceKey(key);
		if (source instanceof Array) {
			if (typeof source.set === 'function') {
				source.set(key, value);
			}
			else {
				source[key] = value;
				this.get('mediator').set(this._sourceField, (<any[]> []).concat(source));
			}
		}
		else {
			// source should be a dojo Store
			source.put(value[source.idProperty], value);
		}
	}

	private _updateList(change:number):void {
		var source = this._source,
			sourceLength = source.length,
			scopedField = this._scopedField;
		if (change > 0) {
			// If array is larger than before add the necessary rows to our list
			this._list.renderArray(source.toArray ? source.toArray() : source);
		}
		else if (change < 0) {
			// If it's smaller, we need to detach any extra widgets
			change = -change;
			for (var i = 0; i < change; ++i) {
				this._widgetIndex[sourceLength + i].detach();
			}
		}
		// Notify all scoped mediators of their current values
		for (var i = 0, len = sourceLength; i < len; ++i) {
			this._mediatorIndex[i]._notify(source[i], null, scopedField);
		}
	}

	private _sourceSetter(source:any):void {
		if (!source) {
			// TODO: teardown
		}
		var list = this._list;
		// Set up observer for new ObservableArray
		if (source !== this._source) {
			this._sourceObserverHandle && this._sourceObserverHandle.remove();
		}
		this._source = source;
		if (source instanceof Array) {
			// Force list render if it doesn't exist or is the wrong kind
			if (!list || list instanceof OnDemandList) {
				this._renderList();
			}
			// Resize and refresh the list
			var lastLength = this._listLength || 0,
				listLength = this._listLength = source.length;
			this._updateList(listLength - lastLength);
			// Add an observer if possible
			if (typeof source.observe === 'function') {
				this._sourceObserverHandle = source.observe((index:number, removals:any[], additions:any[]) => {
					this._updateList(additions.length - removals.length);
				});
			}
		}
		else {
			// Force list render if it doesn't exist or is the wrong kind
			if (!(list instanceof OnDemandList)) {
				this._renderList();
			}
			this._list.set('store', source);
		}
	}

	private _templateSetter(template:any):void {
		// Set constructor since it comes in without one (to avoid being constructed during processing)
		// TODO: pass reference to constructor in options
		this._template = template;
		// TODO: reinstantiate and replace all widgets with new templates (reusing old mediators)
		this._factory = new WidgetFactory(template, this._WidgetCtor);
	}
}

export = Iterator;
