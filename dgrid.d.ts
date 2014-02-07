/// <reference path="./dojo" />

declare module 'dgrid/OnDemandList' {
	class OnDemandList {
		/* readonly */ domNode:HTMLElement;
		constructor(kwArgs:Object);
		destroy():void;
		refresh(options?:Object):IPromise<any>;
		renderRow(value:any, options?:Object):HTMLElement;
	}
	export = OnDemandList;
}
