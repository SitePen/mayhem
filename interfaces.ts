/// <reference path="binding/interfaces.ts" />
/// <reference path="dojo.d.ts" />

interface INotification {
	id?:any;
	object:IStateful;
	key:string;
	oldValue:any;
	newValue:any;
	callbacks:Array<(key:string, oldValue:any, newValue:any) => void>;
}

interface IScheduler {
	schedule(id:string, callback:Function):void;
	dispatch():void;
	afterNext(callback:Function):void;
}

interface IApplication {
	dataBindingRegistry: IDataBindingRegistry;
	scheduler: IScheduler;
}

interface IComponent {
	app: IApplication;
}

interface IMediator extends IComponent, IStateful {
	routeState: Object;
	model: IModel;
}

interface IModel extends IComponent, IStateful {}
