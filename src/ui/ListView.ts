/// <amd-dependency path="./dom/ListView" />

import has = require('../has');
import Widget = require('./Widget');

interface ListView<T> extends Widget {
	get:ListView.Getters<T>;
	on:ListView.Events<T>;
	set:ListView.Setters<T>;
}

module ListView {
	export interface Events<T> extends Widget.Events {}
	export interface Getters<T> extends Widget.Getters {
		(key:'collection'):dstore.ICollection<T>;
		(key:'itemConstructor'):ListView.ItemConstructor<T>;
	}
	export interface Setters<T> extends Widget.Setters {
		(key:'collection', value:dstore.ICollection<T>):void;
		(key:'itemConstructor', value:ListView.ItemConstructor<T>):void;
	}

	export interface ItemConstructor<T> {
		new (kwArgs?:HashMap<any>):ListView.Item<T>;
		prototype:ListView.Item<T>;
	}

	// TODO: This interface is almost identical to View
	export interface Item<T> extends Widget {
		get:Item.Getters<T>;
		set:Item.Setters<T>;
	}

	export module Item {
		export interface Getters<T> extends Widget.Getters {
			(key:'model'):T;
		}
		export interface Setters<T> extends Widget.Setters {
			(key:'model', value:T):void;
		}
	}
}

var ListView:{
	new <T>(kwArgs:HashMap<any>):ListView<T>;
	prototype:ListView<{}>;
};

if (has('host-browser')) {
	ListView = <typeof ListView> require('./dom/ListView');
}

export = ListView;
