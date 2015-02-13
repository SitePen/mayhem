import binding = require('../../../binding/interfaces');
import Container = require('../../../ui/dom/Container');
import lang = require('dojo/_base/lang');
import Proxy = require('../../../data/Proxy');
import Widget = require('../../../ui/dom/Widget');
import View = require('../../../ui/View');
import util = require('../../../util');

class Iterator<T> extends Container {
	static inheritsModel:boolean = true;

	get:Iterator.Getters<T>;
	on:Iterator.Events<T>;
	set:Iterator.Setters<T>;

	protected _as:string;

	protected _binding:binding.IBinding<{}>;

	/**
	 * @get
	 * @set
	 */
	protected _collection:dstore.ICollection<T>;
	protected _collectionGetter():dstore.ICollection<T> {
		return this._collection;
	}
	protected _collectionSetter(collection:dstore.ICollection<T>):void {
		this._collection = collection;

		if (this.get('isAttached')) {
			this._bind();
		}
	}

	_isAttachedGetter():boolean {
		return this._isAttached;
	}
	_isAttachedSetter(value:boolean):void {
		this._isAttached = value;

		if (value) {
			this._bind();
		}
		else {
			this._unbind();
		}
	}

	/**
	 * @get
	 * @set
	 */
	protected _itemConstructor:Iterator.IItemConstructor<T>;

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'collection', 'isAttached' ], '_render');
		super(kwArgs);
	}

	destroy():void {
		this._unbind();
		super.destroy();
	}

	protected _bind():void {
		var collection = this.get('collection');

		this._unbind();
		this._refresh();

		if (collection) {
			this._binding = this._app.get('binder').createBinding(collection, '*');
			this._binding.observe(lang.hitch(this, '_handleChange'));
		}
	}

	protected _unbind():void {
		this._binding && this._binding.destroy();
		this._binding = null;
	}

	protected _refresh():void {
		var collection:any = this.get('collection');

		this.empty();

		if (collection) {
			// TODO: Fix interfaces to support arrays
			if (collection instanceof Array) {
				this._handleChange({
					index: 0,
					added: collection,
					removed: []
				});
			}
			else {
				collection.fetch().then((items:T[]) => {
					this._handleChange({
						index: 0,
						added: items,
						removed: []
					});
				});
			}
		}
	}

	protected _handleChange(change:binding.IChangeRecord<T>):void {
		if (change.removed) {
			var numRemoved = change.removed.length;

			while (numRemoved--) {
				this.remove(change.index);
			}
		}

		if (change.added) {
			var Ctor = this.get('itemConstructor');
			var as = this.get('as') || 'item';
			var app = this.get('app');
			var model = this.get('model');

			change.added.forEach((item:T, index:number) => {
				var widget = new Ctor({
					app: this._app,
					model: new Proxy((function ():HashMap<any> {
						var kwArgs:HashMap<any> = {
							app: app,
							target: model
						};
						kwArgs[as] = item;
						return kwArgs;
					}).call(this))
				});

				this.add(<Widget> widget, change.index + index);
			});
		}
	}
}

module Iterator {
	export interface Events<T> extends Container.Events {}
	export interface Getters<T> extends Container.Getters {
		(key:'as'):string;
		(key:'collection'):dstore.ICollection<T>;
		(key:'itemConstructor'):Iterator.IItemConstructor<T>;
	}
	export interface Setters<T> extends Container.Setters {
		(key:'as', value:string):void;
		(key:'collection', value:dstore.ICollection<T>):void;
		(key:'itemConstructor', value:Iterator.IItemConstructor<T>):void;
	}

	export interface IItemConstructor<T> {
		new (kwArgs?:HashMap<any>):View;
		prototype:View;
	}
}

export = Iterator;
