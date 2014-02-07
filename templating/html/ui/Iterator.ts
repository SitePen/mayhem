/// <reference path="../../../dgrid" />
/// <reference path="../../../dojo" />

import array = require('dojo/_base/array');
import core = require('../../../interfaces');
import lang = require('dojo/_base/lang');
import Memory = require('dojo/store/Memory');
import OnDemandList = require('dgrid/OnDemandList');
import processor = require('../../html');
import SingleNodeWidget = require('../../../ui/dom/SingleNodeWidget');
import util = require('../../../util');
import widgets = require('../../../ui/interfaces');

class Iterator extends SingleNodeWidget {
	private _store:Memory;
	private _list:OnDemandList;
	private _sourceField:string;
	private _sourceFieldObserver:IHandle;
	private _valueField:string;

	constructor(kwArgs:Object) {
		util.deferSetters(this, [ 'each', 'in' ], '_render');
		this._store = new Memory({ idProperty: 'index' });
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

	private _createScopedMediator(mediator:core.IMediator, index:number, initialValue?:any):core.IMediator {
		// Create a new mediator that delegates to the old one
		var options:any = {};
		options['_' + this._valueField + 'Getter'] = ():any => {
			var record:any = this._store.get(index);
			return record ? record.value : initialValue;
		};
		return lang.delegate(mediator, options);
	}

	private _initializeWidgets():void {
		var mediator:core.IMediator = this.get('mediator'),
			template:any = this.get('template'),
			field:string = this._sourceField,
			values:any[] = mediator.get(field)
		this._store.setData(array.map(values, (value:any, index:number):any => {
			var scopedMediator:core.IMediator = this._createScopedMediator(mediator, index, value);
			var widget:widgets.IDomWidget = processor.constructWidget(template, {
				mediator: scopedMediator,
				parent: this
			});
			return { index: index, value: value, widget: widget };
		}));
		this._list.refresh();
		
	}

	/* protected */ _mediatorSetter(mediator:core.IMediator):void {
		super._mediatorSetter(mediator);
		// TODO: update bindings
	}

	private _eachSetter(field:string):void {
		this._valueField = field;
		// Recreate our scoped mediators since our value field changed
		var mediator:core.IMediator = this.get('mediator');
		array.forEach(this._store.data, (record:any) => {
			var scopedMediator:core.IMediator = this._createScopedMediator(mediator, record.index);
			record.widget.set('mediator', scopedMediator);
		});
	}

	private _inSetter(field:string):void {
		this._sourceFieldObserver && this._sourceFieldObserver.remove();
		this._sourceField = field;
		this._initializeWidgets();
		this._sourceFieldObserver = this.get('mediator').observe(field, (newValue:any):void => {
			this._initializeWidgets();
		});
	}

	/* protected */ _render():void {
		super._render();
		this._firstNode.appendChild(this._list.domNode);
	}
}

export = Iterator;
