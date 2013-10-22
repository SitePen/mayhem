/// <reference path="interfaces.ts" />

interface IStateful {
	new (kwArgs:Object);
	get(key:string):any;
	set(kwArgs:Object):void;
	set(key:string, value:any):void;
	watch(key:string, callback:(key?:string, oldValue?:any, newValue?:any) => void):IHandle;
	watch(callback:(key?:string, oldValue?:any, newValue?:any) => void):IHandle;
}

declare module 'dojo/_base/array' {
	var array:{
		forEach(Array, callback:(value:any, index?:number, array?:Array) => void, thisArg?:any): void;
	};
	export = array;
}

declare module 'dojo/_base/declare' {
	var decl:{
		(superclass:Function, properties:Object):any;
		(superclass:Function[], properties:Object):any;
		safeMixin(target:Object, source:Object):any;
	};

	export = decl;
}

declare module 'dojo/_base/lang' {
	var lang:{
		mixin<T>(target:T, ...source:Object[]):T;
		getObject(key:string, create?:boolean, context?:Object):any;
		setObject(key:string, value:any, context?:Object):any;
		hitch<T>(context:Object, fn:T): T;
		hitch(context:Object, property:string, ...prefixedArgs:Object[]):Function;
		hitch(context:Object, fn:Function, ...prefixedArgs:Object[]):Function;
		partial<T>(fn:T): T;
		partial(fn:Function, ...prefixedArgs:any[]): Function;
		delegate<T>(object:T, properties?:Object):T;
		trim(string:string):string;
		replace(template:string, kwArgs:Object, pattern?:RegExp):string;
	};
	export = lang;
}

declare module 'dojo/has' {
	var has:{
		(feature:string):any;
		add(feature:string, value:any):void;
	};
	export = has;
}

declare module 'dojo/Stateful' {
	var Stateful:IStateful;
	export = Stateful;
}
