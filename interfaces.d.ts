/// <reference path="./dojo" />

export interface IApplication extends IObservableEvented {
	get:IApplication.Getters;
	set:IApplication.Setters;
	startup():IPromise<IApplication>;
}

export declare module IApplication {
	export interface Getters extends IObservableEvented.Getters {}
	export interface Setters extends IObservableEvented.Setters {}
}

////

export interface IApplicationComponent extends IObservable {
	get:IApplicationComponent.Getters;
	set:IApplicationComponent.Setters;
}

export declare module IApplicationComponent {
	export interface Getters extends IObservable.Getters {
		(key:'app'):IApplication;
	}

	export interface Setters extends IObservable.Setters {}
}

////

export interface IDestroyable {
	destroy():void;
}

////

export interface IEvent {
	bubbles:boolean;
	cancelable:boolean;
	currentTarget:any;
	defaultPrevented:boolean;
	propagationStopped:boolean;
	target:any;
	timeStamp:number;
	type:string;

	preventDefault():void;
	stopPropagation():void;
}

export interface IEventListener {
	(event:IEvent):void;
}

////

export interface IHasMetadata {
	getMetadata(key:string):IObservable;
}

////

export interface IObservable extends IDestroyable {
	get:IObservable.Getters;
	set:IObservable.Setters;

	observe<T>(key:string, observer:IObserver<T>):IHandle;
}

export declare module IObservable {
	export interface Getters {
		(key:string):void;
	}

	export interface Setters {
		(kwArgs:HashMap<any>):void;
		(key:string, value:any):void;
	}
}

export interface IObservableEvented extends IObservable {
	emit(event:IEvent):boolean;
	on(type:IExtensionEvent, listener:(event:IEvent) => void):IHandle;
	on(type:string, listener:(event:IEvent) => void):IHandle;
}

export declare module IObservableEvented {
	export interface Getters extends IObservable.Getters {}
	export interface Setters extends IObservable.Setters {}
}

export interface IObserver<T> {
	(newValue:T, oldValue:T, key?:string):void;
}
