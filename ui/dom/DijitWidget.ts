/// <reference path="../../dijit" />

import array = require('dojo/_base/array');
import ContentComponent = require('./ContentComponent');
import core = require('../../interfaces');
import __WidgetBase = require('dijit/_WidgetBase');
import PlacePosition = require('../PlacePosition');
import SingleNodeWidget = require('./SingleNodeWidget');
import ui = require('../interfaces');
import util = require('../../util');

/* abstract */ class DijitWidget extends SingleNodeWidget implements ui.IContainer {
	/* protected */ _children:DijitWidget[];
	/* protected */ _content:ui.IDomWidget;
	/* protected */ _dijit:__WidgetBase;
	/* protected */ _dijitActions:string[];
	/* protected */ _dijitArgs:any;
	/* protected */ _dijitCtor:any; // new () => __WidgetBase;
	/* protected */ _dijitFields:string[];
	/* protected */ _disabled:boolean; // TODO: coerce string values coming from templates
	/* protected */ _firstNode:HTMLElement;
	/* protected */ _lastNode:HTMLElement;
	/* protected */ _parent:ui.IContainer;

	constructor(kwArgs:any = {}) {
		util.deferMethods(this, [ '_placeChildren', '_contentSetter' ], '_render');
		// TODO: this is a hack and needs cleanup
		this._setDijitFields('disabled', 'iconClass', 'label', 'region', 'splitter', 'style', 'title', 'tooltip');

		// Build up dijit kwArgs and methods from the fields provided
		var dijitArgs:any = this._dijitArgs = {};
		if ('id' in kwArgs) {
			dijitArgs.id = kwArgs.id;
		}

		array.forEach(this._dijitFields || [], (field:string) => {
			if (field in kwArgs) {
				dijitArgs[field] = kwArgs[field];
			}
			this['_' + field + 'Setter'] = (value:any):void => {
				this['_' + field] = value;
				this._dijit && this._dijit.set(field, value);
			};
		});
		// We need to do something slightly different for actions
		array.forEach(this._dijitActions || [], (field:string) => {
			var action = (e:Event):boolean => {
				var mediator:core.IMediator = this.get('mediator');
				var method:string = this['_' + field];
				console.log('action called:', field, '-- mediator method:', method)
				return mediator[method] ? mediator[method](e) : true;
			};
			if (field in kwArgs) {
				dijitArgs[field] = action;
			}
			this['_' + field + 'Setter'] = (method:any):void => {
				this['_' + field] = method;
				this._dijit && this._dijit.set(field, action);
			};
		});

		super(kwArgs);
	}

	/* protected */ _attachedSetter(attached:boolean):void {
		if (attached) this._dijit.startup();
		super._attachedSetter(attached);
	}

	/* protected */ _childrenSetter(children:ui.IDomWidget[]):void {
		this._children = [];
		// Handle case where Element widget is our content
		var content:ui.IDomWidget = children[0];
		// TODO: better test for element
		if (content && content['_html'] && children.length === 1) {
			this.set('content', content);
			return;
		}
		this._children = <DijitWidget[]> children;
		this._placeChildren();
	}

	/* protected */ _contentSetter(content:ui.IDomWidget):void {
		this._content = content;
		if (content) {
			this._dijit.containerNode.appendChild(content.detach());
		}
	}

	destroy():void {
		if (this._content) {
			this._content.destroy();
			this._content = null;
		}
		if (this._dijit) {
			this._dijit.destroyRecursive();
			this._dijit = null;
		}
		super.destroy();
	}

	// TODO: DijitContainer?
	private _placeChildren():void {
		var child:DijitWidget;
		for (var i = 0; (child = this._children[i]); ++i) {
			this._dijit.addChild(child._dijit);
			child.set('index', i);
			child.set('parent', this);
		}
	}

	/* protected */ _render():void {
		var dijit:__WidgetBase = new this._dijitCtor(this._dijitArgs);
		this.get('classList').set(dijit.domNode.className);
		this._firstNode = this._lastNode = dijit.domNode;
		this.set('dijit', dijit);
	}

	/* protected */ _setDijitActions(...keys:string[]):void {
		this._dijitActions = (this._dijitActions || []).concat(keys);
	}

	/* protected */ _setDijitCtor(ctor:any):void {
		// TODO: this should really be a default property definition but typescript fails here
		// First Ctor wins
		this._dijitCtor || (this._dijitCtor = ctor);
	}

	/* protected */ _setDijitFields(...keys:string[]):void {
		this._dijitFields = (this._dijitFields || []).concat(keys);
	}

	// ui.IContainer
	add:{
		(widget:ui.IDomWidget, position:PlacePosition):IHandle;
		(widget:ui.IDomWidget, position:number):IHandle;
		(widget:ui.IDomWidget, placeholder:string):IHandle;
	};

	empty: { ():void; };

	remove:{ (index:number):void; (widget:ui.IWidget):void; };
}

// FIXME: util.applyMixins(DijitWidget, [ ContentComponent ]);
Object.keys(ContentComponent).forEach((key:string) => {
	DijitWidget.prototype[key] = ContentComponent.prototype[key];
})

export = DijitWidget;
