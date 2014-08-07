/// <reference path="../../../dgrid" />
/// <reference path="../../../dstore" />

import core = require('../../../interfaces');
import DstoreAdapter = require('dstore/legacy/DstoreAdapter');
import has = require('../../../has');
import LegacyObservable = require('dojo/store/Observable');
import OnDemandList = require('dgrid/OnDemandList');
import SingleNodeWidget = require('../../../ui/dom/SingleNodeWidget');
import util = require('../../../util');

var oidKey:string = '__IteratorOid' + String(Math.random()).slice(2);

class IteratorList<T> extends OnDemandList {
	private _app:core.IApplication;
	private _itemConstructor:Iterator.IItemConstructor<T>;

	constructor(kwArgs?:HashMap<any>) {
		super(kwArgs);

		// dgrid kwArgs don't call setters
		this._setApp(kwArgs['app']);
		this._setItemConstructor(kwArgs['itemConstructor']);
	}

	_setApp(value:core.IApplication):void {
		this._app = value;
	}

	_setItemConstructor(value:Iterator.IItemConstructor<T>):void {
		this._itemConstructor = value;
		this.refresh();
	}

	insertRow():HTMLElement {
		var row:HTMLElement = super.insertRow.apply(this, arguments);
		(<Iterator.IItem<T>> row[oidKey]).set('isAttached', true);
		return row;
	}

	renderRow(model:Object, options?:Object):HTMLElement {
		var Ctor:Iterator.IItemConstructor<T> = this._itemConstructor;
		var widget:SingleNodeWidget = new Ctor({
			app: this._app,
			model: model
		});

		var rowNode:HTMLElement = <HTMLElement> widget.detach();
		// dgrid currently does not support rows that are not actually nodes
		if (rowNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
			var surrogate:HTMLDivElement = document.createElement('div');
			surrogate.appendChild(rowNode);
			rowNode = surrogate;
		}

		if (has('es5')) {
			Object.defineProperty(rowNode, oidKey, {
				value: widget,
				configurable: true
			});
		}
		else {
			rowNode[oidKey] = widget;
		}

		// TODO: Set `isAttached` on widget

		return rowNode;
	}

	removeRow(row:HTMLElement, justCleanup:boolean):void {
		super.removeRow(row, true);
		var widget:Iterator.IItem<T> = row[oidKey];
		widget.destroy();

		// Avoid DOM-JS circular reference memory retention in IE8
		if (!has('es5')) {
			row[oidKey] = null;
		}
	}
}

class Iterator<T> extends SingleNodeWidget {
	/**
	 * @get
	 * @set
	 */
	private _collection:dstore.ICollection<T>;

	/**
	 * @get
	 * @set
	 */
	private _itemConstructor:Iterator.IItemConstructor<T>;

	private _widget:IteratorList<T>;

	get:Iterator.Getters<T>;
	on:Iterator.Events<T>;
	set:Iterator.Setters<T>;

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'collection' ], '_render');
		super(kwArgs);
	}

	_collectionSetter(value:dstore.ICollection<T>):void {
		this._widget.set('store', value ? new LegacyObservable(new DstoreAdapter({ store: value })) : <any> value);
		this._collection = value;
	}

	_isAttachedSetter(value:boolean):void {
		if (value) {
			this._widget._started ? this._widget.resize() : this._widget.startup();
		}
	}

	_render():void {
		this._widget = new IteratorList<T>({
			app: this._app,
			itemConstructor: this._itemConstructor
		});

		this._node = this._widget.domNode;
	}
}

module Iterator {
	export interface Events<T> extends SingleNodeWidget.Events {}
	export interface Getters<T> extends SingleNodeWidget.Getters {
		(key:'collection'):dstore.ICollection<T>;
		(key:'itemConstructor'):Iterator.IItemConstructor<T>;
	}
	export interface Setters<T> extends SingleNodeWidget.Setters {
		(key:'collection', value:dstore.ICollection<T>):void;
		(key:'itemConstructor', value:Iterator.IItemConstructor<T>):void;
	}

	export interface IItemConstructor<T> {
		new (kwArgs?:HashMap<any>):Iterator.IItem<T>;
	}

	export interface IItem<T> extends SingleNodeWidget {
		get:Iterator.IItem.Getters<T>;
		set:Iterator.IItem.Setters<T>;
	}

	export module IItem {
		export interface Getters<T> extends SingleNodeWidget.Getters {
			(key:'model'):T;
		}
		export interface Setters<T> extends SingleNodeWidget.Setters {
			(key:'model', value:T):void;
		}
	}
}

export = Iterator;
