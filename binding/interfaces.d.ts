import core = require('../interfaces');
import DataBindingDirection = require('./DataBindingDirection');

export interface IDataBindingRegistry extends core.IComponent {
	add(Binder:IPropertyBinder, index?:number):IHandle;
	test(kwArgs:IDataBindingArguments):boolean;
	bind(kwArgs:IDataBindingArguments):IBindingHandle;
}

export interface IPropertyRegistry extends IDataBindingRegistry {
	createProperty(object:Object, binding:string):IBoundProperty;
	createProperty(object:Object, binding:string, options:{ scheduled?:boolean; }):IBoundProperty;
}

export interface IBindingHandle extends IHandle {
	setSource(source:Object, sourceBinding?:string):void;
	setTarget(target:Object, targetBinding?:string):void;
	setDirection(direction:DataBindingDirection):void;
}

export interface IDataBindingArguments {
	source:Object;
	sourceBinding:string;
	target:Object;
	targetBinding:string;
	direction?:number;
}

export interface IPropertyBinder {
	new (kwArgs:IPropertyBinderArguments):IBoundProperty;
	test(kwArgs:IPropertyBinderArguments):boolean;
}

export interface IPropertyBinderArguments {
	object:Object;
	binding:string;
	registry:IPropertyRegistry;
}

export interface IBoundProperty {
	id:string;
	get():any;
	set(value:any):void;
	bindTo(target:IBoundProperty):IHandle;
	destroy():void;
}

export interface IComputedProperty {
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
