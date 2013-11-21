/// <reference path="../interfaces.ts" />

interface IDataBindingRegistry extends IComponent {
	add(Binder:IPropertyBinder, index?:number):IHandle;
	createProperty(object:Object, binding:string):IBoundProperty;
	test(kwArgs:IDataBindingArguments):boolean;
	bind(kwArgs:IDataBindingArguments):IHandle;
}

interface IDataBindingArguments {
	source:Object;
	sourceBinding:string;
	target:Object;
	targetBinding:string;
	direction?:number;
}

interface IPropertyBinder {
	new (kwArgs:IPropertyBinderArguments):IBoundProperty;
	test(kwArgs:IPropertyBinderTestArguments):boolean;
}

interface IPropertyBinderTestArguments {
	object:Object;
	binding:string;
}

interface IPropertyBinderArguments extends IPropertyBinderTestArguments {
	registry:IDataBindingRegistry;
}

interface IBoundProperty {
	id:string;
	get():any;
	set(value:any):void;
	bindTo(target:IBoundProperty):IHandle;
	destroy():void;
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
