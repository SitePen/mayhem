/// <reference path="./dojo" />

import binding = require('./binding/interfaces');

export interface IApplication {
	dataBindingRegistry:binding.IDataBindingRegistry;
	scheduler:IScheduler;
}

// TODO: Unused?
export interface IApplicationComponent extends IComponent {}

export interface IComponent {
	app:IApplication;
}

export interface IMediator extends IComponent, IStateful {
	model:IModel;
	routeState:Object;
}

export interface IModel extends IComponent {
	additionalProperties:boolean;
	scenario:string;
	schema:Object;

	get(key:string):any;
	isValid():boolean;
	property(key:string):IModelProperty;
	remove():any;
	save(skipValidation?:boolean):IPromise<void>;
	set(key:string, value:any):void;
	validate(fields?:string[]):IPromise<boolean>;
}

export interface IModelProperty {
	get(key:string):any;
	put(key:string, value:any):void;
	receive(callback:(value:any) => void):IHandle;
	validate():void;
}

export interface IProperty {
	/**
	 * An identifier for this bound property. Bound properties that bind to the same object using the same binding
	 * string will have identical identifiers.
	 */
	id:string;

	/**
	 * Permanently destroys the binding to the original property.
	 */
	destroy():void;

	/**
	 * Retrieves the current value of the bound property.
	 */
	get():any;

	// TODO
	observe?(callback:(value:any, oldValue:any) => IPromise<any>):IHandle;

	/**
	 * Sets the value of the bound property. Setting the value of the property using this method does not cause the
	 * value of any bound target property to change.
	 */
	set(value:any):void;
}

export interface IRoute {
	router:IRouter;
}

export interface IRouter extends IApplicationComponent {
	createPath:(routeId:string, kwArgs:Object) => string;
	defaultRoute:string;
	destroy:() => void;
	go:(routeId:string, kwArgs:Object) => void;
	normalizeId:(routeId:string) => string;
	notFoundRoute:string;
	pause:() => void;
	resetPath:(path:string, replace:boolean) => void;
	resume:() => void;
	startup:() => IPromise<void>;
}

export interface IScheduler {
	afterNext(callback:Function):void;
	dispatch():void;
	schedule(id:string, callback:Function):void;
}

export interface IStatefulArray<T> extends Array<T> {
	set(index:number, value:any):void;
}

export interface IStatefulArrayWatcher<T> {
	(index:number, removals:T[], additions:T[]):void;
}
