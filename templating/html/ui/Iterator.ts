/// <reference path="../../../dgrid" />
/// <reference path="../../../dstore" />

import core = require('../../../interfaces');
import ContainerMixin = require('../../../ui/common/Container');
import DstoreAdapter = require('dstore/legacy/DstoreAdapter');
import has = require('../../../has');
import OnDemandList = require('dgrid/OnDemandList');
import Proxy = require('../../../data/Proxy');
import QueryResults = require('dojo/store/util/QueryResults');
import SingleNodeWidget = require('../../../ui/dom/SingleNodeWidget');
import util = require('../../../util');
import Widget = require('../../../ui/dom/Widget');

var Node:Node;
if (has('dom-addeventlistener')) {
	Node = (<any> window).Node;
}
else {
	Node = <any> {
		ELEMENT_NODE: 1,
		ATTRIBUTE_NODE: 2,
		TEXT_NODE: 3,
		COMMENT_NODE: 8,
		DOCUMENT_NODE: 9,
		DOCUMENT_FRAGMENT_NODE: 11
	};
}

var oidKey:string = '__IteratorOid' + String(Math.random()).slice(2);

/**
 * The IteratorList class extends a dgrid OnDemandList with functionality for using
 */
class IteratorList<T> extends OnDemandList {
	private _app:core.IApplication;
	private _as:string;
	private _itemConstructor:Iterator.IItemConstructor<T>;
	private _isAttached:boolean;
	private _parent:Iterator<T>;
	private _rowIdToObject:{ [id:string]:{}; };

	constructor(kwArgs?:HashMap<any>) {
		super(kwArgs);

		this._isAttached = false;

		// dgrid kwArgs don't call setters
		this._setApp(kwArgs['app']);
		this._setItemConstructor(kwArgs['itemConstructor']);
		// they also do not use underscored property names
		this._setAs(kwArgs['as']);
		this._setParent(kwArgs['parent']);
	}

	_setApp(value:core.IApplication):void {
		this._app = value;
	}

	_setAs(value:string):void {
		this._as = value;
	}

	_setItemConstructor(value:Iterator.IItemConstructor<T>):void {
		this._itemConstructor = value;
		this.refresh();
	}

	_setParent(value:Iterator<T>):void {
		this._parent = value;
	}

	_setIsAttached(value:boolean):void {
		for (var id in this._rowIdToObject) {
			var rowElement:any = document.getElementById(id);
			rowElement && rowElement[oidKey].set('isAttached', value);
		}
		this._isAttached = value;
	}

	insertRow():HTMLElement {
		var row:HTMLElement = super.insertRow.apply(this, arguments);
		// TS7017
		ContainerMixin.prototype.add.call(this._parent, (<any> row)[oidKey]);
		return row;
	}

	renderRow(model:Object, options?:Object):HTMLElement {
		var Ctor:Iterator.IItemConstructor<T> = this._itemConstructor;

		if (!this._as) {
			this._as = 'item';
		}

		var widget:SingleNodeWidget = new Ctor({
			app: this._app,
			model: new Proxy((function ():HashMap<any> {
				var kwArgs:HashMap<any> = {
					app: this._app,
					target: this._parent.get('model')
				};
				kwArgs[this._as] = model;
				return kwArgs;
			}).call(this))
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
			// TS7017
			(<any> rowNode)[oidKey] = widget;
		}

		return rowNode;
	}

	removeRow(row:HTMLElement, justCleanup:boolean):void {
		super.removeRow(row, true);
		// TS7017
		var widget:Iterator.IItem<T> = (<any> row)[oidKey];
		widget.destroy();

		// row was a surrogate node
		if (row.parentNode) {
			row.parentNode.removeChild(row);
		}

		// Avoid DOM-JS circular reference memory retention in IE8
		if (!has('es5')) {
			// TS7017
			(<any> row)[oidKey] = null;
		}
	}
}

class Iterator<T> extends SingleNodeWidget {
	/**
	 * @get
	 * @set
	 */
	private _as:string;

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
		if (value) {
			var store:IStore<T> = new DstoreAdapter(value);
			var oldQuery:Function = store.query;
			store.query = function ():any {
				var queryResults:QueryResults<T> = oldQuery.apply(this, arguments);
				var oldObserve:Function = queryResults.observe;
				queryResults.observe = function (callback:Function):IHandle {
					// Force includeObjectUpdates to false since data binding ensures the contents are up-to-date
					return oldObserve.call(this, callback, false);
				};
				return queryResults;
			};
		}

		this._widget.set('store', store);
		this._collection = value;
	}

	_isAttachedSetter(value:boolean):void {
		this._widget.set('isAttached', value);
		this._isAttached = value;

		if (value) {
			this._widget._started ? this._widget.resize() : this._widget.startup();
		}
	}

	// TODO: Implement necessary container interfaces
	remove(child:Widget):void {
		child.detach();
		ContainerMixin.prototype.remove.call(this, child);
	}

	_render():void {
		this._widget = new IteratorList<T>({
			as: this._as,
			app: this._app,
			itemConstructor: this._itemConstructor,
			parent: this
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
		prototype:Iterator.IItem<T>;
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
