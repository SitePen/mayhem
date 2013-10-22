/// <reference path="../interfaces.ts" />

interface IDataBindingArguments {
	from:Object;
	fromBinding:string;
	to:Object;
	toBinding:string;
}

interface IDataBindingRegistry {
	add(binder:IDataBinder, index?:number): IHandle;
	test(kwArgs:IDataBindingArguments): boolean;
	bind(kwArgs:IDataBindingArguments): IDataBindingHandle;
}

interface IDataBinder {
	test(kwArgs:IDataBindingArguments): boolean;
	bind(kwArgs:IDataBindingArguments): IDataBindingHandle;
}

interface IComputedProperty {
	/**
	 * Inferrence for whether or not an object on a data model is actually a computed property.
	 * Will always be `true`.
	 */
	isComputed: boolean;

	/**
	 * The getter method for the computed property.
	 */
	get(): any;

	/**
	 * An optional setter method for the computed property. If not defined, the computed property will be considered
	 * read-only.
	 */
	set?(value:any): void;

	/**
	 * A list of other properties that the computed property uses when generating itself. Used to ensure that the
	 * computed property is updated whenever any of its dependencies are updated. The dependencies themselves are
	 */
	dependencies: string[];
}

interface IDataBindingHandle extends IHandle {
	to: Object;
	listen(callback:(value:any, oldValue:any) => void): IHandle;
	set(value:any): void;
}
