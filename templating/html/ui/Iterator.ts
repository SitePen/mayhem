/// <reference path="../../../dgrid" />
/// <reference path="../../../dojo" />

import array = require('dojo/_base/array');
import core = require('../../../interfaces');
import MemoryStore = require('dojo/store/Memory');
import OnDemandList = require('dgrid/OnDemandList');
import ObservableArray = require('../../../ObservableArray');
import processor = require('../../html');
import SingleNodeWidget = require('../../../ui/dom/SingleNodeWidget');
import util = require('../../../util');
import widgets = require('../../../ui/interfaces');

class Iterator extends SingleNodeWidget {
	private _list:OnDemandList;
	private _elementIndex:{ [key:string]: HTMLElement; };
	private _mediatorIndex:{ [key:string]: core.IMediator; };
	private _rowElementType:string;
	private _sourceField:string;
	private _sourceFieldObserver:IHandle;
	private _store:MemoryStore<any>;
	private _template:any;
	private _scopedField:string;
	private _silent:boolean;
	private _source:any; // Array | ObservableArray | IStore<any>
	private _sourceObserver:IHandle;
	private _arraySource:boolean;
	private _widgetIndex:{ [key:string]: widgets.IDomWidget; };

	constructor(kwArgs:Object) {
		this._rowElementType = 'div';
		this._mediatorIndex = {};
		this._widgetIndex = {};
		this._elementIndex = {};
		util.deferSetters(this, [ 'each', 'in' ], '_render');
		this._list = new OnDemandList({
			renderRow: (record:any, options:any):HTMLElement => {
				return this._getElementByKey(record[this._store.idProperty]);
			}
		});
		super(kwArgs);
	}

	private _createScopedMediator(key:string, mediator?:core.IMediator):core.IMediator {
		mediator || (mediator = this.get('mediator'));
		// Create a new mediator that delegates to the old one
		return util.createScopedMediator(mediator, this._scopedField, ():any => {
			var record = this._store.get(key);
			if (this._arraySource) {
				return record.value;
			}
			return record;
		}, (value:any):void => {
			if (this._arraySource) {
				// Signal a silent update to ignore repaint
				this._silent = true;
				this._source.set(key, value);
				this._silent = false;
			}
			else {
				this._store.put(key, value);
			}
		});
	}

	destroy():void {
		this._list.destroy();
		this._list = this._store = null;
		this._source = this._sourceField = this._scopedField = null;

		this._sourceFieldObserver && this._sourceFieldObserver.remove();
		this._sourceObserver && this._sourceObserver.remove();
		this._sourceFieldObserver = this._sourceObserver = null;

		super.destroy();
	}

	private _eachSetter(field:string):void {
		this._scopedField = field;
		// Recreate our scoped mediators since the name of our value field changed
		var mediator:core.IMediator = this.get('mediator');
		array.forEach(util.getObjectKeys(this._widgetIndex), (key:string) => {
			var scopedMediator:core.IMediator = this._mediatorIndex[key] = this._createScopedMediator(key, mediator);
			this._widgetIndex[key].set('mediator', scopedMediator);
		});
	}

	private _getElementByKey(key:string):HTMLElement {
		if (this._elementIndex[key]) {
			return this._elementIndex[key];
		}
		var widget = this._getWidgetByKey(key);
		var element:HTMLElement = document.createElement(this._rowElementType);
		element.appendChild(widget.detach());
		return this._elementIndex[key] = element;
	}

	private _getMediatorByKey(key:string):core.IMediator {
		if (this._mediatorIndex[key]) {
			return this._mediatorIndex[key];
		}
		// Create and cache a new mediator that delegates to the old one
		return this._mediatorIndex[key] = this._createScopedMediator(key);
	}

	private _getWidgetByKey(key:string):widgets.IDomWidget {
		var widget:widgets.IDomWidget = this._widgetIndex[key];
		if (widget) {
			return widget;
		}
		var mediator = this._getMediatorByKey(key);
		return this._widgetIndex[key] = processor.constructWidget(this._template, {
			mediator: mediator,
			parent: this
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

	private _sourceSetter(source:any):void {
		// TODO: tear down old store
		this._source = source;
		this._sourceObserver && this._sourceObserver.remove();
		this._arraySource = source instanceof Array || source instanceof ObservableArray;
		if (this._arraySource) {
			// Build a MemoryStore mirroring values array, observing where possible
			// TODO: tear down old store
			var store = this._store = new MemoryStore({
				idProperty: 'i',
				data: array.map(source, (value:any, i:number) => ({ i: i, value: value }))
			});

			if (source.observe) {
				// Splice and dice store on observable array changes
				this._sourceObserver = source.observe((startIndex:number, removals:any[], additions:any[]):void => {
					// Shortcut all this nasty MemoryStore muning for simple set calls
					if (removals.length === 1 && additions.length === 1) {
						store.put({ i: startIndex, value: additions[0] });
					}
					else {
						var storeData:any = store.data,
							removed:any[] = storeData.splice(startIndex, removals.length);

						// Transform additions values to records and splice them into our store data
						var added:any[] = array.map(additions, (value:any, i:number):any => {
							return { i: startIndex + i, value: value };
						});

						// TODO: fix when typescript gets splats...
						// storeData.splice(i, 0, ...added);
						storeData.splice.apply(storeData, [ startIndex, 0 ].concat(added));
						// Fix up the remaining ids and rebuild index
						for (var i = startIndex, end = storeData.length; i < end; ++i) {
							storeData[i].i = i;
						}
						store.setData(storeData);
					}

					if (!this._silent) {
						// We need to call refresh before notifying affected mediators to ensure they exist
						this._list.refresh();
						// TODO: this is terrible...we need to somethign like a BindingProxty for ObservableArrays to handle binding to elements
						// Fire a notification on affected mediators (just from startIndex)
						for (var i = startIndex, l = storeData.length; i < l; ++i) {
							this._mediatorIndex[i]._notify(storeData[i].value, null, this._scopedField);
						}
					}
					// TODO: if removals.length > additions.length clean up objects associated with discarded trailing keys
				});
			}
		}
		else {
			this._store = source;
			// TODO: observe store for updates, destroy removed widgets
		}

		this._list.set('store', this._store);
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
