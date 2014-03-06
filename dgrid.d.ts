/// <reference path="./dojo" />

declare module 'dgrid/List' {
	class List {
		/* readonly */ domNode:HTMLElement;
		constructor(kwArgs?:Object);

		get(key:string):any;

		set(kwArgs:{ [key:string]: any; }):void;
		set(key:string, value:any):void;

		destroy():void;

		insertRow(object:any, parent:any, beforeNode:Node, i:number, options?:any):HTMLElement;

		refresh(options?:Object):IPromise<any>;

		renderArray(results:any, beforeNode?:Node, options?:any):HTMLElement;

		renderRow(value:any, options?:Object):HTMLElement;
	}

	export = List;
}

declare module 'dgrid/OnDemandList' {
	import List = require('dgrid/List');

	class OnDemandList extends List {

		get(key:'store'):IStore<any>;
		get(key:string):any;

		set(key:'store', value:IStore<any>):void;
		set(kwArgs:{ [key:string]: any; }):void;
		set(key:string, value:any):void;
	}

	export = OnDemandList;
}
