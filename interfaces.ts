/// <reference path="binding/interfaces.ts" />
/// <reference path="dojo.d.ts" />

interface IScheduler {
	schedule(id:string, callback:Function):void;
	dispatch():void;
	afterNext(callback:Function):void;
}

interface IApplication {
	dataBindingRegistry:IDataBindingRegistry;
	scheduler:IScheduler;
}

interface IComponent {
	app:IApplication;
}

interface IApplicationComponent extends IComponent {}

interface IMediator extends IComponent, IStateful {
	routeState:Object;
	model:IModel;
}

interface IModel extends IComponent, IStateful {}

interface IRouter extends IApplicationComponent {
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

interface IRoute {
	router:IRouter;
}

interface IView extends IComponent, IStateful {
	add(subView:IView, placeholder:string):IHandle;
	placeAt(element:Element):IHandle;
}
