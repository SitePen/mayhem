/// <reference path="./dojo" />

import ObservableEvented = require('./ObservableEvented');

export interface IApplication extends ObservableEvented {
	get:IApplication.Getters;
	on:IApplication.Events;
	set:IApplication.Setters;
	startup():IPromise<IApplication>;
}

export declare module IApplication {
	export interface Events extends ObservableEvented.Events {}
	export interface Getters extends ObservableEvented.Getters {}
	export interface Setters extends ObservableEvented.Setters {}
}

////

export interface IApplicationComponent extends IObservable {
	get:IApplicationComponent.Getters;
	set:IApplicationComponent.Setters;
	startup():IPromise<void>;
}

export declare module IApplicationComponent {
	export interface Getters extends IObservable.Getters {
		(key:'app'):IApplication;
	}

	export interface Setters extends IObservable.Setters {
		(key:'app', value:IApplication):void;
	}
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
	timeStamp:number;
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

// TODO: Should be getDescriptor or similar
export interface IHasMetadata {
	getMetadata(key:string):IObservable;
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
		(kwArgs:HashMap<any>):void;
		(key:string, value:any):void;
	}
}

export interface IObserver<T> {
	(newValue:T, oldValue:T, key?:string):void;
}
