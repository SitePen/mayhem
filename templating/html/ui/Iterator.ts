/// <reference path="../../../dgrid" />
/// <reference path="../../../dstore" />

import DstoreAdapter = require('dstore/legacy/DstoreAdapter');
import has = require('../../../has');
import OnDemandList = require('dgrid/OnDemandList');
import SingleNodeWidget = require('../../../ui/dom/SingleNodeWidget');
import util = require('../../../util');

var oidKey:string = '__IteratorOid' + String(Math.random()).slice(2);

class IteratorList<T> extends OnDemandList {
	private _itemConstructor:Iterator.IItemConstructor<T>;

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
			model: model
		});

		var row:HTMLElement = <HTMLElement> widget.get('firstNode');

		if (has('es5')) {
			Object.defineProperty(row, oidKey, {
				value: widget,
				configurable: true
			});
		}
		else {
			row[oidKey] = widget;
		}

		return row;
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

	_collectionSetter(value:dstore.ICollection<T>):void {
		this._widget.set('store', new DstoreAdapter({ store: value }));
		this._collection = value;
	}

	_isAttachedSetter(value:boolean):void {
		if (value) {
			this._widget._started ? this._widget.resize() : this._widget.startup();
		}
	}

	_render():void {
		this._widget = new IteratorList<T>({});
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
