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

export interface IModel extends IComponent, IStateful {
	scenario:string;

	isFieldRequired(key:string):boolean;
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
