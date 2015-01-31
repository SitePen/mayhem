import binding = require('./binding/interfaces');
import ObservableEvented = require('./ObservableEvented');

export interface IApplication extends ObservableEvented {
	get:IApplication.Getters;
	on:IApplication.Events;
	set:IApplication.Setters;
	run():IPromise<IApplication>;
}

export declare module IApplication {
	export interface Events extends ObservableEvented.Events {}
	export interface Getters extends ObservableEvented.Getters {
		(key:'binder'):binding.IBinder;
	}
	export interface Setters extends ObservableEvented.Setters {}
}

////

export interface IApplicationComponent {
	run?():IPromise<void>;
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
	immediatePropagationStopped:boolean;
	propagationStopped:boolean;
	target:any;
	timestamp:number;
	type:string;

	preventDefault():void;
	stopImmediatePropagation():void;
	stopPropagation():void;
}

export interface IErrorEvent extends IEvent {
	error:Error;
}

export interface IEventListener<T extends IEvent> {
	(event:T):void;
}

////

export interface IObservable extends IDestroyable {
	get:IObservable.Getters;
	set:IObservable.Setters;

	// TODO: Should expose correct interface for all observers, like Getters, throughout framework
	observe(key:string, observer:IObserver<any>):IHandle;
}

export declare module IObservable {
	export interface Getters {
		(key:string):void;
	}

	export interface Setters {
		(kwArgs:{}):void;
		(key:string, value:any):void;
	}
}

export interface IObserver<T> {
	(newValue:T, oldValue:T, key?:string):void;
}
