/// <reference path="../interfaces.ts" />

interface IDataBindingArguments {
	from:Object;
	property:string;
	to:Object;
	binding:string;
}

interface IDataBindingRegistry {
	add(binder:IDataBinding, index:number): IHandle;
	test(kwArgs:IDataBindingArguments): boolean;
	bind(kwArgs:IDataBindingArguments): IDataBindingHandle;
}

interface IDataBinding {
	test(kwArgs:IDataBindingArguments): boolean;
	bind(kwArgs:IDataBindingArguments): IDataBindingHandle;
}

interface IComputedProperty {
	isComputed: boolean;
	get(): any;
	set?(value:any): void;
	dependencies: string[];
}

interface IDataBindingHandle extends IHandle {
	to:Object;
	notify(value:any): void;
}
