/// <reference path="../../dojo" />
/// <reference path="../../dijit" />

import _Container = require('dijit/_Container');
import DijitWidget = require('./DijitWidget');
import DomContainer = require('./Container');
import PlacePosition = require('../PlacePosition');
import util = require('../../util');
import widgets = require('../interfaces');

/* abstract */ class DijitContainer extends DijitWidget implements widgets.IContainer {
	/* protected */ _children:widgets.IDomWidget[];
	/* protected */ _content:widgets.IDomWidget;
	/* protected */ _dijit:_Container;
	/* protected */ _dijitChildren:DijitWidget[];

	constructor(kwArgs:Object = {}) {
		this._dijitChildren = [];
		util.deferMethods(this, [ '_processChildren' ], '_render');
		super(kwArgs);
	}

	_childrenSetter(children:widgets.IDomWidget[]):void {
		this._children = children = children || [];
		var child:widgets.IDomWidget;
		for (var i = 0, l = children.length; i < l; ++i) {
			child = children[i];
			if (child instanceof DijitWidget) {
				this._dijitChildren.push(<DijitWidget> child);
			}
		}
		this._processChildren();
	}

	_contentSetter(content:widgets.IDomWidget):void {
		this._content = content;
		this._dijit.containerNode.appendChild(content.detach());
	}

	destroy():void {
		if (this._content) {
			this._content.destroy();
			this._content = null;
		}
		super.destroy();
	}

	_processChildren():void {
		var dijitChildren = this._dijitChildren;
		if (dijitChildren.length) {
			for (var i = 0, l = dijitChildren.length; i < l; ++i) {
				this._dijit.addChild(dijitChildren[i]._dijit);
			}
		}
		else {
			// TODO: handle multiple children
			// Assume children is a single Element widget and set as content
			var child = this._children[0];
			if (child && this._children.length === 1) {
				this._children = [];
				this.set('content', child);
			}
		}
	}

	// widgets.IContainer
	add:{
		(widget:widgets.IDomWidget, position:PlacePosition):IHandle;
		(widget:widgets.IDomWidget, position:number):IHandle;
		(widget:widgets.IDomWidget, placeholder:string):IHandle;
	};

	empty: { ():void; };

	remove:{ (index:number):void; (widget:widgets.IWidget):void; };
}

//util.applyMixins(DijitContainer, [ DomContainer ]);
Object.keys(DomContainer).forEach((key:string) => {
	DijitContainer.prototype[key] = DomContainer.prototype[key];
})

export = DijitContainer;
