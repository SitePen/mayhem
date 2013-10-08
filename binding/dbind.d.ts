/// <reference path="../interfaces.ts" />

interface Stateful {
	get(key:string): any;
	set(key:string, value:any): void;
	set(kwArgs:Object): void;
	watch(key:string, callback:(key:string, oldValue:any, newValue:any) => void): void;
}

interface Binding {
	new (value:Object):Binding;

	value:any;
	source:Object;
	callbacks:Array<(value:any) => void>;

	receive(callback?:(value:any) => void):IHandle;
	getValue(callback:(value:any) => void):void;
	get(key:string, callback:(value:any) => void):IHandle;
	get(key:string):Binding;
	put(value:Object):void;
	set(name:string, value:any):void;
	is(value:any):void;
	keys(callback:(key:string, value:any) => void):void;
	to(source:Object, property?:string):Binding;
}

interface StatefulBinding extends Binding {
	new (stateful:Stateful):StatefulBinding;

	stateful:Stateful;

	get(key:string):StatefulPropertyBinding;
	to(source:Object, property?:string):StatefulBinding;
}

interface StatefulPropertyBinding extends Binding {
	new (stateful:Stateful, name:string):StatefulPropertyBinding;

	stateful:Stateful;
	name:string;
}

interface ElementBinding extends Binding {
	new (element:Element, container:boolean):ElementBinding;

	element:Element;
	container:boolean;

	to(source:Object, property?:string):ElementBinding;
}

interface ContainerBinding {
	(element:Element):ElementBinding;
}

interface ArrayBinding extends Binding {}

interface PropertyBinding extends Binding {
	new (object:Object, name:string):PropertyBinding;
	object:Object;
	name:string;
}

interface FunctionBinding {
	new (func:Function, reverseFunc:Function):FunctionBinding;

	func:Function;
	reverseFunc:Function;

	receive(callback?:(value:any) => void):void;
	get(key:string):Binding;
	put(value:any):void;
	is():void;
	to(source:any):FunctionBinding;
	keys():void;
}

interface Dbind {
	<T>(binding:{ _binding: T }, ...args:any[]):T;
	(binding:{ get: any; is: any; }, ...args:any[]):Binding;
	(statefulObject:{ get: any; }, ...args:any[]):StatefulBinding;
	(element:{ nodeType: any; }, ...args:any[]):ElementBinding;
	(fn:Function, ...args:any[]):FunctionBinding;
	(array:Array, ...args:any[]):ArrayBinding;
	(binding:Object, ...args:any[]):Binding;

	get(object:Object, key:string, callback:Function):PropertyBinding;
	get(object:Object, callback:Function):void;

	Element:ElementBinding;
	Container:ContainerBinding;
	Binding:Binding;

	when(value:any, callback:Function):any;
}

declare module 'dbind' {
	var bind:Dbind;
	export = bind;
}
