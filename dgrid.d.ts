/// <reference path="./dojo" />

declare module 'dgrid/OnDemandList' {
	class OnDemandList {
		constructor(kwArgs:Object);
		/* readonly */ domNode:HTMLElement;
		refresh(options?:Object):IPromise<any>;
		renderRow(value:any, options?:Object):HTMLElement;
	}
	export = OnDemandList;
}
