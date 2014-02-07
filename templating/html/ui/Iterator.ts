/// <reference path="../../../dgrid" />
/// <reference path="../../../dojo" />

import array = require('dojo/_base/array');
import core = require('../../../interfaces');
import Memory = require('dojo/store/Memory');
import OnDemandList = require('dgrid/OnDemandList');
import processor = require('../../html');
import SingleNodeWidget = require('../../../ui/dom/SingleNodeWidget');
import util = require('../../../util');
import widgets = require('../../../ui/interfaces');

interface IRecord {
	i:number;
	value:any;
	widget:widgets.IDomWidget;
}

class Iterator extends SingleNodeWidget {
	private _ignoreUpdates:boolean;
	private _list:OnDemandList;
	private _sourceField:string;
	private _sourceFieldObserver:IHandle;
	private _store:Memory;
	private _valueField:string;
	private _values:any;
	private _valuesObserver:IHandle;

	constructor(kwArgs:Object) {
		util.deferSetters(this, [ 'each', 'in' ], '_render');
		this._store = new Memory({ idProperty: 'i' });
		this._list = new OnDemandList({
			store: this._store,
			renderRow: (record:any):HTMLElement => {
				var div:HTMLDivElement = document.createElement('div');
				div.appendChild(record.widget.detach());
				return div;
			}
		});
		super(kwArgs);
	}

	private _createRecord(initialValue:any, mediator?:core.IMediator, template?:any):IRecord {
		mediator || (mediator = this.get('mediator'));
		template || (template = this.get('template'));
		var record:any = { value: initialValue };
		var scopedMediator:core.IMediator = this._createScopedMediator(record, mediator);
		record.widget = processor.constructWidget(template, { mediator: scopedMediator, parent: this });
		return record;
	}

	private _createScopedMediator(record:IRecord, mediator:core.IMediator):core.IMediator {
		// Create a new mediator that delegates to the old one
		return util.createScopedMediator(mediator, this._valueField, ():any => {
			return record.value;
		}, (value:any):void => {
			// Update backing values array silently
			record.value = value;
			this._ignoreUpdates = true;
			this._values.set(record.i, value);
			this._ignoreUpdates = false;
		});
	}

	destroy():void {
		this._list.destroy();
		this._list = this._store = null;
		this._values = this._sourceField = this._valueField = null;

		this._sourceFieldObserver && this._sourceFieldObserver.remove();
		this._valuesObserver && this._valuesObserver.remove();
		this._sourceFieldObserver = this._valuesObserver = null;

		super.destroy();
	}

	private _valuesSetter(values:any):void {
		this._values = values;
		this._valuesObserver && this._valuesObserver.remove();
		this._setStoreData(values);
		this._list.refresh();
		if (values.observe) {
			this._valuesObserver = values.observe((i:number, removals:any[], additions:any[]):void => {
				// Echo suppression
				if (this._ignoreUpdates) {
					return;
				}
				var mediator = this.get('mediator'),
					template = this.get('template'),
					storeData = this._store.data,
					indexObject:any = {};

				// Splice off and clean up widgets slated for removal
				var removed:IRecord[] = storeData.splice(i, i + removals.length);
				array.forEach(removed, (record:IRecord, i:number) => {
					record.widget.destroy();
					removed[i] = null;
				});
				// Transform additions values to records and splice them into our store data
				var records:IRecord[] = array.map(additions, (value:any, i:number):IRecord => {
					return this._createRecord(value, mediator, template);
				});
				// TODO: fix when typescript gets splats...
				// storeData.splice(i, 0, ...records);
				storeData.splice.apply(storeData, [ i, 0 ].concat(<any[]> records));
				// Manually reset all indexes since we we've mucked around with internal state
				array.forEach(storeData, (record:IRecord, j:number) => {
					record.i = j;
					indexObject[j] = j;
				});
				this._store.index = indexObject;
				this._list.refresh();
			});
		}
	}

	private _eachSetter(field:string):void {
		this._valueField = field;
		// Recreate our scoped mediators since our value field changed
		var mediator:core.IMediator = this.get('mediator');
		array.forEach(this._store.data, (record:any) => {
			var scopedMediator:core.IMediator = this._createScopedMediator(record, mediator);
			record.widget.set('mediator', scopedMediator);
		});
	}

	private _inSetter(sourceField:string):void {
		this._sourceFieldObserver && this._sourceFieldObserver.remove();
		this._sourceField = sourceField;
		var mediator = this.get('mediator');
		this.set('values', mediator.get(sourceField));
		this._sourceFieldObserver = mediator.observe(sourceField, (newValue:any):void => {
			this.set('values', newValue);
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

	private _setStoreData(data:any):void {
		var mediator:core.IMediator = this.get('mediator'),
			template:any = this.get('template');
		this._store.setData(array.map(data, (value:any, i:number):IRecord => {
			var record:any = this._createRecord(value, mediator, template);
			record.i = i;
			return record;
		}));
	}

	private _updateWidgetsList(size:number):void {

	}
}

export = Iterator;
