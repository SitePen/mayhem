import core = require('../../interfaces');
import ContainerMixin = require('../common/Container');
import DstoreAdapter = require('dstore/legacy/DstoreAdapter');
import has = require('../../has');
import OnDemandList = require('dgrid/OnDemandList');
import QueryResults = require('dojo/store/util/QueryResults');
import SingleNodeWidget = require('./SingleNodeWidget');
import util = require('../../util');
import Widget = require('./Widget');

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

var oidKey:string = '__ListViewOid' + String(Math.random()).slice(2);

/**
 * The IteratorList class extends a dgrid OnDemandList with functionality for using
 */
class IteratorList<T> extends OnDemandList {
	private _app:core.IApplication;
	private _itemConstructor:ListView.IItemConstructor<T>;
	private _parent:ListView<T>;
	private _rowIdToObject:{ [id:string]:{}; };

	constructor(kwArgs?:HashMap<any>) {
		super(kwArgs);

		// dgrid kwArgs don't call setters
		this._setApp(kwArgs['app']);
		this._setItemConstructor(kwArgs['itemConstructor']);
		// they also do not use underscored property names
		this._setParent(kwArgs['parent']);
	}

	_setApp(value:core.IApplication):void {
		this._app = value;
	}

	_setItemConstructor(value:ListView.IItemConstructor<T>):void {
		this._itemConstructor = value;
		this.refresh();
	}

	_setParent(value:ListView<T>):void {
		this._parent = value;
	}

	_setIsAttached(value:boolean):void {
		for (var id in this._rowIdToObject) {
			var rowElement:any = document.getElementById(id);
			rowElement && rowElement[oidKey].set('isAttached', value);
		}

		if (value) {
			this._started ? this.resize() : this.startup();
		}
	}

	insertRow():HTMLElement {
		var row:HTMLElement = super.insertRow.apply(this, arguments);
		// TS7017
		ContainerMixin.prototype.add.call(this._parent, (<any> row)[oidKey]);
		return row;
	}

	renderRow(model:Object, options?:Object):HTMLElement {
		var Ctor:ListView.IItemConstructor<T> = this._itemConstructor;

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
			// TS7017
			(<any> rowNode)[oidKey] = widget;
		}

		return rowNode;
	}

	removeRow(row:HTMLElement, justCleanup:boolean):void {
		super.removeRow(row, true);
		// TS7017
		var widget:ListView.IItem<T> = (<any> row)[oidKey];
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

class ListView<T> extends SingleNodeWidget {
	/**
	 * @get
	 * @set
	 */
	private _collection:dstore.ICollection<T>;

	/**
	 * @get
	 * @set
	 */
	private _itemConstructor:ListView.IItemConstructor<T>;

	private _widget:IteratorList<T>;

	get:ListView.Getters<T>;
	on:ListView.Events<T>;
	set:ListView.Setters<T>;

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'collection' ], '_render');
		super(kwArgs);
	}

	_collectionGetter():dstore.ICollection<T> {
		return this._collection;
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

	_isAttachedGetter():boolean {
		return this._isAttached;
	}
	_isAttachedSetter(value:boolean):void {
		if (this._isAttached === value) {
			return;
		}

		this._isAttached = value;
		this._widget.set('isAttached', value);
	}

	// TODO: Implement necessary container interfaces
	remove(child:Widget):void {
		child.detach();
		ContainerMixin.prototype.remove.call(this, child);
	}

	_render():void {
		this._widget = new IteratorList<T>({
			app: this._app,
			itemConstructor: this._itemConstructor,
			parent: this
		});

		this._node = this._widget.domNode;
	}
}

module ListView {
	export interface Events<T> extends SingleNodeWidget.Events {}
	export interface Getters<T> extends SingleNodeWidget.Getters {
		(key:'collection'):dstore.ICollection<T>;
		(key:'itemConstructor'):ListView.IItemConstructor<T>;
	}
	export interface Setters<T> extends SingleNodeWidget.Setters {
		(key:'collection', value:dstore.ICollection<T>):void;
		(key:'itemConstructor', value:ListView.IItemConstructor<T>):void;
	}

	export interface IItemConstructor<T> {
		new (kwArgs?:HashMap<any>):ListView.IItem<T>;
		prototype:ListView.IItem<T>;
	}

	export interface IItem<T> extends SingleNodeWidget {
		get:ListView.IItem.Getters<T>;
		set:ListView.IItem.Setters<T>;
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

export = ListView;
