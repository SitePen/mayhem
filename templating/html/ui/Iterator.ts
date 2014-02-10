/// <reference path="../../../dgrid" />
/// <reference path="../../../dojo" />

import array = require('dojo/_base/array');
import core = require('../../../interfaces');
import MemoryStore = require('dojo/store/Memory');
import ObservableStore = require('dojo/store/Observable');
import OnDemandList = require('dgrid/OnDemandList');
import processor = require('../../html');
import SingleNodeWidget = require('../../../ui/dom/SingleNodeWidget');
import util = require('../../../util');
import widgets = require('../../../ui/interfaces');

class Iterator extends SingleNodeWidget {
	private _list:OnDemandList;
	private _mediatorIndex:{ [key:string]: core.IMediator; };
	private _rowElementType:string;
	private _sourceField:string;
	private _sourceFieldObserver:IHandle;
	private _store:MemoryStore<any>;
	private _template:any;
	private _valueField:string;
	private _source:any; // Array | ObservableArray | IStore<any>
	private _sourceObserver:IHandle;
	private _storeSource:boolean;
	private _widgetIndex:{ [key:string]: widgets.IDomWidget; };

	constructor(kwArgs:Object) {
		this._rowElementType = 'div';
		this._mediatorIndex = {};
		this._widgetIndex = {};
		util.deferSetters(this, [ 'each', 'in' ], '_render');
		this._list = new OnDemandList({
			renderRow: (record:any, options:any):HTMLElement => {
				console.log('rec',record, options)
				var el:HTMLElement = document.createElement(this._rowElementType);
				var widget = this._getWidget(record[this._store.idProperty]);
				el.appendChild(widget.detach());
				return el;
			}
		});
		super(kwArgs);
	}

	private _createScopedMediator(key:string, mediator?:core.IMediator):core.IMediator {
		mediator || (mediator = this.get('mediator'));
		// Create a new mediator that delegates to the old one
		return util.createScopedMediator(mediator, this._valueField, ():any => {
			var record = this._store.get(key);
			if (this._storeSource) {
				return record;
			}
			return record.value;
		}, (value:any):void => {
			if (this._storeSource) {
				this._store.put(key, value);
			}
			else {
				this._store.put({ i: key, value: value });
			}
		});
	}

	destroy():void {
		this._list.destroy();
		this._list = this._store = null;
		this._source = this._sourceField = this._valueField = null;

		this._sourceFieldObserver && this._sourceFieldObserver.remove();
		this._sourceObserver && this._sourceObserver.remove();
		this._sourceFieldObserver = this._sourceObserver = null;

		super.destroy();
	}

	private _getMediator(key:string):core.IMediator {
		if (this._mediatorIndex[key]) {
			return this._mediatorIndex[key];
		}
		// Create and cache a new mediator that delegates to the old one
		return this._mediatorIndex[key] = this._createScopedMediator(key);
	}

	private _getWidget(key:string):widgets.IDomWidget {
		var widget:widgets.IDomWidget = this._widgetIndex[key];
		if (widget) {
			return widget;
		}
		var mediator = this._getMediator(key);
		return this._widgetIndex[key] = processor.constructWidget(this._template, {
			mediator: mediator,
			parent: this
		});
	}

	private _sourceSetter(source:any):void {
		// TODO: tear down old store
		this._source = source;
		this._sourceObserver && this._sourceObserver.remove();
		this._storeSource = source instanceof MemoryStore; // TODO: should test for any store
		if (this._storeSource) {
			this._store = source;
			// TODO: observe store for updates
		}
		else {
			// Build a MemoryStore that mirrors values array, observing where possible
			// TODO: tear down old store
			var store = this._store = new ObservableStore(new MemoryStore({
				idProperty: 'i',
				data: array.map(source, (value:any, i:number) => ({ i: i, value: value }))
			}));

			if (source.observe) {
				this._sourceObserver = source.observe((i:number, removals:any[], additions:any[]):void => {
					// TODO: splice and dice new mediators and widgets

					// 		var mediator = this.get('mediator'),
					// 			storeData = this._store.data,
					// 			indexObject:any = {};

					// 		// Splice off and clean up widgets slated for removal
					// 		var removed:IRecord[] = storeData.splice(i, i + removals.length);
					// 		array.forEach(removed, (record:IRecord, i:number) => {
					// 			record.widget.destroy();
					// 			removed[i] = null;
					// 		});
					// 		// Transform additions values to records and splice them into our store data
					// 		var records:IRecord[] = array.map(additions, (value:any, i:number):IRecord => {
					// 			return this._createRecord(value, mediator);
					// 		});
					// 		// TODO: fix when typescript gets splats...
					// 		// storeData.splice(i, 0, ...records);
					// 		storeData.splice.apply(storeData, [ i, 0 ].concat(<any[]> records));
					// 		// Manually reset all indexes since we we've mucked around with internal state
					// 		array.forEach(storeData, (record:IRecord, j:number) => {
					// 			record.i = j;
					// 			indexObject[j] = j;
					// 		});
					// 		this._store.index = indexObject;
					// 		this._list.refresh();
					
				});
			}
		}

		this._list.set('store', this._store);
	}

	private _eachSetter(field:string):void {
		this._valueField = field;
		// Recreate our scoped mediators since the name of our value field changed
		var mediator:core.IMediator = this.get('mediator');
		array.forEach(util.getObjectKeys(this._widgetIndex), (key:string) => {
			var scopedMediator:core.IMediator = this._mediatorIndex[key] = this._createScopedMediator(key, mediator);
			this._widgetIndex[key].set('mediator', scopedMediator);
		});
	}

	private _inSetter(sourceField:string):void {
		// Tells us which field to use to get our source
		this._sourceFieldObserver && this._sourceFieldObserver.remove();
		this._sourceField = sourceField;
		var mediator = this.get('mediator');
		this.set('source', mediator.get(sourceField));
		this._sourceFieldObserver = mediator.observe(sourceField, (newValue:any):void => {
			this.set('source', newValue);
		});
	}

	/* protected */ _mediatorSetter(mediator:core.IMediator):void {
		super._mediatorSetter(mediator);
		// TODO: update bindings
	}

	/* protected */ _render():void {
		super._render();
		this._firstNode.appendChild(this._list.domNode);
	}

	private _templateSetter(template:any):void {
		this._template = template;
		// TODO: reinstantiate and replace all widgets with new templates (reusing old mediators)
	}
}

export = Iterator;
