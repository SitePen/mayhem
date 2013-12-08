/// <reference path="dojo.d.ts" />

import binding = require('./binding/interfaces');

export interface IScheduler {
	schedule(id:string, callback:Function):void;
	dispatch():void;
	afterNext(callback:Function):void;
}

export interface IApplication {
	dataBindingRegistry:binding.IDataBindingRegistry;
	scheduler:IScheduler;
}

export interface IComponent {
	app:IApplication;
}

export interface IApplicationComponent extends IComponent {}

export interface IMediator extends IComponent, IStateful {
	routeState:Object;
	model:IModel;
}

export interface IModel extends IComponent, IStateful {}

export interface IRouter extends IApplicationComponent {
	defaultRoute:string;
	notFoundRoute:string;
	startup:() => IPromise<void>;
	destroy:() => void;
	resume:() => void;
	pause:() => void;
	go:(routeId:string, kwArgs:Object) => void;
	resetPath:(path:string, replace:boolean) => void;
	createPath:(routeId:string, kwArgs:Object) => string;
	normalizeId:(routeId:string) => string;
}

export interface IRoute {
	router:IRouter;
}

export interface IView extends IComponent, IStateful {
	add(subView:IView, placeholder:string):IHandle;
	placeAt(element:Element):IHandle;
}
