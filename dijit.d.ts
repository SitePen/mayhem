/// <reference path="./dojo" />

declare module 'dijit/Destroyable' {
	class Destroyable {
		own(destroyable:Destroyable):void;
		own(handle:IHandle):void;
	}
	export = Destroyable;
}

declare module 'dijit/_WidgetBase' {
	import Destroyable = require('dijit/Destroyable');
	import Evented = require('dojo/Evented');
	import Stateful = require('dojo/Stateful');

	interface _WidgetBase extends Stateful, Evented, Destroyable {
		/* readonly */ domNode:HTMLElement;

		get(key:'className'):string;
		get(key:'domNode'):HTMLElement;
		get(key:string):any;

		set(key:'className', value:string):void;
		set(kwArgs:{ [key:string]: any; }):void;
		set(key:string, value:any):void;

		destroy(preserveDom?:boolean):void;
		destroyDescendants(preserveDom?:boolean):void;
		destroyRecursive(preserveDom?:boolean):void;
		destroyRendering(preserveDom?:boolean):void;

		placeAt(referenceNode:HTMLElement, position:string):_WidgetBase;
		placeAt(referenceWidget:_WidgetBase, position:string):_WidgetBase;
		placeAt(referenceNode:HTMLElement, position:number):_WidgetBase;
		placeAt(referenceWidget:_WidgetBase, position:number):_WidgetBase;

		startup():void;
	}

	var _WidgetBase:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):_WidgetBase;
	};

	export = _WidgetBase;
}

declare module 'dijit/form/TextBox' {
	import _WidgetBase = require('dijit/_WidgetBase');

	interface TextBox extends _WidgetBase {
		get(key:'intermediateChanges'):boolean;
		get(key:'value'):string;
		get(key:string):any;

		set(key:'intermediateChanges', value:boolean):void;
		set(key:'value', value:string):void;
		set(kwArgs:{ [key:string]: any; }):void;
		set(key:string, value:any):void;
	}

	var TextBox:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):TextBox;
	};

	export = TextBox;
}

declare module 'dijit/form/Button' {
	import _WidgetBase = require('dijit/_WidgetBase');

	interface Button extends _WidgetBase {
		constructor(kwArgs?:Object):Button;

		get(key:'label'):string;
		get(key:'type'):string;
		get(key:string):any;

		onClick:(event:Event) => void;

		set(key:'label', value:boolean):void;
		set(key:'type', value:string):void;
		set(kwArgs:{ [key:string]: any; }):void;
		set(key:string, value:any):void;
	}

	var Button:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):Button;
	};

	export = Button;
}
