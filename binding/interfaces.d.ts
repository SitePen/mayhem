import core = require('../interfaces');
import DataBindingDirection = require('./DataBindingDirection');

/**
 * IBindingHandle extends the standard removal handle with added functionality for modifying the source, target, and
 * direction of the resulting data binding.
 */
export interface IBindingHandle extends IHandle {
	// TODO: Is it a bad limitation to not be able to set only the bindings?
	setSource(source:Object, sourceBinding?:string):void;
	setTarget(target:Object, targetBinding?:string):void;
	setDirection(direction:DataBindingDirection):void;
}

/**
 * An IBoundProperty object represents an arbitrary property on an arbitrary JavaScript object. By using an opaque
 * IBoundProperty object, the value of any property can be updated, retrieved, and bound to another property without
 * needing to know the originally bound object, the name of the property, or even that the property exists at the time
 * that it is bound or set.
 */
export interface IBoundProperty {
	/**
	 * An identifier for this bound property. Bound properties that bind to the same object using the same binding
	 * string will have identical identifiers.
	 */
	id:string;

	/**
	 * Retrieves the current value of the bound property.
	 */
	get():any;

	/**
	 * Sets the value of the bound property. Setting the value of the property using this method does not cause the
	 * value of any bound target property to change.
	 */
	set(value:any):void;

	/**
	 * Binds the property to another target property. The target property is only notified of a change when the actual
	 * property is updated; calling `set` on this bound property will *not* update the bound target value.
	 */
	bindTo(target:IBoundProperty, options?:IBoundPropertyOptions):IHandle;

	/**
	 * Permanently destroys the binding to the original property.
	 */
	destroy():void;
}

export interface IBoundPropertyOptions {
	setValue?:boolean;
}

/**
 * The keyword arguments object for the high-level data binding API.
 */
export interface IDataBindingArguments {
	/**
	 * The source object to bind to.
	 */
	source:Object;

	/**
	 * The binding string for the property being bound on the source object. The binding string can be any arbitrary
	 * string but is typically an identifier or expression. The data binding registry in use determines whether or not
	 * the specified binding string is valid.
	 */
	sourceBinding:string;

	/**
	 * The target object to bind to.
	 */
	target:Object;

	/**
	 * The binding string for the property being bound on the target object.
	 */
	targetBinding:string;

	/**
	 * The direction in which the two properties are bound. By default, the direction is `ONE_WAY`, which means that
	 * only the source is bound to the target. A `TWO_WAY` binding keeps the source and target in sync no matter which
	 * changes.
	 */
	direction?:DataBindingDirection;
}

/**
 * IDataBindingRegistry provides the high-level data binding API for simple binding together of two object properties.
 */
export interface IDataBindingRegistry extends core.IComponent {
	/**
	 * Tests whether or not the given data binding arguments can be used to successfully bind the objects together.
	 */
	test(kwArgs:IDataBindingArguments):boolean;

	/**
	 * Creates a data binding between the objects given in `kwArgs`.
	 */
	bind(kwArgs:IDataBindingArguments):IBindingHandle;
}

/**
 * IPropertyBinder constructors are responsible for implementing the actual property binding logic for the default
 * PropertyRegistry data binding registry. They are typically classes that implement `IBoundProperty` with an
 * additional static `test` function.
 */
export interface IPropertyBinder {
	new (kwArgs:IPropertyBinderArguments):IBoundProperty;

	/**
	 * Tests whether or not the property binder can successfully create a bound property from the given object and
	 * binding string.
	 */
	test(kwArgs:IPropertyBinderArguments):boolean;
}

/**
 * The keyword arguments object for property binders.
 */
export interface IPropertyBinderArguments {
	/**
	 * The object to bind to.
	 */
	object:Object;

	/**
	 * The binding string to use when creating the binding.
	 */
	binding:string;

	/**
	 * The property registry that is creating the bound property. Providing this information to the property binder
	 * enables property binders to peel away sections of a binding string to compose complex wirings of bound
	 * properties.
	 */
	registry:IPropertyRegistry;
}

/**
 * IPropertyRegistry is the interface definition for the default IBoundProperty-based data binding registry.
 * This type of registry operates on the principle of registering IPropertyBinders, which create opaque bound property
 * objects that are then wired together in series to create complex chains of arbitrary bindings between objects.
 */
export interface IPropertyRegistry extends IDataBindingRegistry {
	/**
	 * Adds a property binder to the property registry.
	 */
	add(Binder:IPropertyBinder, index?:number):IHandle;

	/**
	 * Creates a bound property object from a given object and binding string. This method must be exposed publicly
	 * in order to allow property binders to peel away sections of binding strings.
	 */
	createProperty(object:Object, binding:string, options?:{ scheduled?:boolean; }):IBoundProperty;
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
