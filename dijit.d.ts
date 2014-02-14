/// <reference path="./dojo" />

declare module 'dijit/_Container' {
	import _WidgetBase = require('dijit/_WidgetBase');

	interface _Container extends _WidgetBase {
		/* readonly */ containerNode:HTMLElement;
		addChild(widget:_WidgetBase, insertIndex?:number):_WidgetBase;

		hasChildren():boolean;

		removeChild(widget:_WidgetBase):void;
		removeChild(index:number):void;
	}

	var _Container:{
	};

	export = _Container;
}

declare module 'dijit/Destroyable' {
	class Destroyable {
		own(destroyable:Destroyable):void;
		own(handle:IHandle):void;
	}
	export = Destroyable;
}

declare module 'dijit/DropDownMenu' {
	import _Container = require('dijit/_Container');
	import _WidgetBase = require('dijit/_WidgetBase');

	interface DropDownMenu extends _Container {
	}

	var DropDownMenu:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):DropDownMenu;
	};

	export = DropDownMenu;
}

declare module 'dijit/Menu' {
	import DropDownMenu = require('dijit/DropDownMenu');

	interface Menu extends DropDownMenu {
	}

	var Menu:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):Menu;
	};

	export = Menu;
}

declare module 'dijit/MenuItem' {
	import _WidgetBase = require('dijit/_WidgetBase');

	interface MenuItem extends _WidgetBase {
	}

	var MenuItem:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):MenuItem;
	};

	export = MenuItem;
}

declare module 'dijit/_WidgetBase' {
	import Destroyable = require('dijit/Destroyable');
	import Evented = require('dojo/Evented');
	import Stateful = require('dojo/Stateful');

	interface _WidgetBase extends Stateful, Evented, Destroyable {
		/* readonly */ domNode:HTMLElement;

		constructor(kwArgs?:Object, srcNodeRef?:HTMLElement):_WidgetBase;

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

declare module 'dijit/form/Button' {
	import _Container = require('dijit/_Container');
	import _WidgetBase = require('dijit/_WidgetBase');

	interface Button extends _Container {
	}

	var Button:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):Button;
	};

	export = Button;
}

declare module 'dijit/form/CheckBox' {
	import _WidgetBase = require('dijit/_WidgetBase');

	interface CheckBox extends _WidgetBase {
	}

	var CheckBox:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):CheckBox;
	};

	export = CheckBox;
}

declare module 'dijit/form/DropDownButton' {
	import Button = require('dijit/form/Button');

	interface DropDownButton extends Button {
	}

	var DropDownButton:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):DropDownButton;
	};

	export = DropDownButton;
}

declare module 'dijit/form/RadioButton' {
	import CheckBox = require('dijit/form/CheckBox');

	interface RadioButton extends CheckBox {
	}

	var RadioButton:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):RadioButton;
	};

	export = RadioButton;
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

declare module 'dijit/form/ToggleButton' {
	import Button = require('dijit/form/Button');

	interface ToggleButton extends Button {
	}

	var ToggleButton:{
		new (kwArgs?:Object, srcNodeRef?:HTMLElement):ToggleButton;
	};

	export = ToggleButton;
}
