/// <reference path="../dojo/dojo.d.ts" />

declare module 'dgrid/Keyboard' {
	class Keyboard {}

	export = Keyboard;
}

declare module 'dgrid/List' {
	class List {
		/* readonly */ domNode:HTMLElement;
		selection:any; // TODO: interface for dgrid/Selection
		_started:boolean;

		constructor(kwArgs?:Object);

		get(key:string):any;

		set(kwArgs:{ [key:string]: any; }):void;
		set(key:string, value:any):void;

		destroy():void;
		insertRow(object:any, parent:any, beforeNode:Node, i:number, options?:any):HTMLElement;
		on(type:string, listener:EventListener):IHandle;
		_onNotification(rows?:any[], object?:any, from?:number, to?:number):void;
		refresh(options?:Object):IPromise<any>;
		removeRow(rowElement:any, justCleanup?:boolean):void;
		renderArray(results:any, beforeNode?:Node, options?:any):HTMLElement;
		renderRow(value:any, options?:Object):HTMLElement;
		resize():void;
		startup():void;
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

declare module 'dgrid/Selection' {
	class Selection {}

	export = Selection;
}
