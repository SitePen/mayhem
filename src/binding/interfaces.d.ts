import BindDirection = require('./BindDirection');
import core = require('../interfaces');

/**
 * The keyword arguments object for the high-level data binding API.
 */
export interface IBindArguments {
	/**
	 * The source object to bind to.
	 */
	source:Object;

	/**
	 * The binding string for the property being bound on the source object. The binding string can be any arbitrary
	 * string but is typically an identifier or expression. The data binding registry in use determines whether or not
	 * the specified binding string is valid.
	 */
	sourcePath:string;

	/**
	 * The target object to bind to.
	 */
	target:Object;

	/**
	 * The binding string for the property being bound on the target object.
	 */
	targetPath:string;

	/**
	 * The direction in which the two properties are bound. By default, the direction is `ONE_WAY`, which means that
	 * only the source is bound to the target. A `TWO_WAY` binding keeps the source and target in sync no matter which
	 * changes.
	 */
	direction?:BindDirection;
}

/**
 * IBinder provides the high-level data binding API for creating reactive objects and binding together two object
 * properties.
 */
export interface IBinder extends core.IApplicationComponent {
	/**
	 * Tests whether or not the given data binding arguments can be used to successfully bind two objects together.
	 */
	test(kwArgs:IBindArguments):boolean;

	/**
	 * Creates a data binding between the objects given in `kwArgs`. This is a convenience function that creates two
	 * proxties for source and target and binds between them.
	 */
	bind(kwArgs:IBindArguments):IBindingHandle;

	/**
	 * Creates a proxty object from a given object and binding string. This method must be exposed publicly
	 * in order to allow property binders to peel away sections of binding strings, and to allow access to additional
	 * interfaces exposed on subtypes of IProxty.
	 */
	createBinding<T>(object:{}, path:string, options?:{ useScheduler?:boolean; }):IBinding<T>;

	observe(object:{}, path:string, observer:IObserver<any>):IHandle;
}

/**
 * IBindingHandle extends the standard removal handle with added functionality for modifying the source, target, and
 * direction of the resulting data binding.
 */
export interface IBindingHandle extends IHandle {
	// TODO: Is it a bad limitation to not be able to set only the bindings?
	setSource(source:{}, sourcePath?:string):void;
	setTarget(target:{}, targetPath?:string):void;
	setDirection(direction:BindDirection):void;
}

/**
 * TODO: Documentation updates
 * An IBindingProxty object represents an arbitrary property on an arbitrary JavaScript object. By using an opaque
 * IBindingProxty object, the value of any property can be updated, retrieved, and bound to another property without
 * needing to know the originally bound object, the name of the property, or even that the property exists at the time
 * that it is bound or set.
 */
export interface IBinding<T> {
	destroy():void;
	get():T;
	getObject():{};
	notify(change:IChangeRecord<T>):void;
	observe(observer:IObserver<T>, invokeImmediately?:boolean):IHandle;
	set?(value:T):void;
}

/**
 * The keyword arguments object for property bindings.
 */
export interface IBindingArguments {
	/**
	 * The object to bind to.
	 */
	object:Object;

	/**
	 * The binding string to use when creating the binding.
	 */
	path:string;

	/**
	 * The binder that is creating the bound property. Providing this information to the property binder
	 * enables property binders to peel away sections of a binding string to compose complex wirings of bound
	 * properties.
	 */
	binder:IBinder;
}

/**
 * IPropertyBinder constructors are responsible for implementing the actual property binding logic for the default
 * PropertyRegistry data binding registry. They are typically classes that implement `IBoundProperty` with an
 * additional static `test` function.
 */
export interface IBindingConstructor {
	new <T>(kwArgs:IBindingArguments):IBinding<T>;

	/**
	 * Tests whether or not the property binder can successfully create a bound property from the given object and
	 * binding string.
	 */
	test(kwArgs:IBindingArguments):boolean;
}

export interface IChangeRecord<T> {
	added?:T[];
	index?:number;
	oldValue?:T;
	removed?:T[];
	value?:T;
}

// TODO: Do something with this or delete it.
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

export interface IObserver<T> {
	(change:IChangeRecord<T>):void;
}
