/// <reference path="../../dojo" />

import binding = require('../../binding/interfaces');
import core = require('../../interfaces');
import DomWidget = require('./DomWidget');
import has = require('../../has');
import ObservableEvented = require('../../ObservableEvented');
import Placeholder = require('./Placeholder');
import PlacePosition = require('../PlacePosition');
import ui = require('../interfaces');
import util = require('../../util');

class DomWidgetContainer extends DomWidget implements ui.IWidgetContainer {
	/* protected */ _children:ui.IDomWidget[];
	/* protected */ _placeholders:{ [name:string]: ui.IPlaceholder; };

	constructor(kwArgs?:any) {
		this._children || (this._children = []);
		this._placeholders || (this._placeholders = {});
		super(kwArgs);
	}

	add(widget:ui.IDomWidget, position?:PlacePosition):IHandle;
	add(widget:ui.IDomWidget, position?:number):IHandle;
	add(widget:ui.IDomWidget, placeholder?:string):IHandle;
	add(widget:ui.IDomWidget, position:any = PlacePosition.LAST):IHandle {
		var handle:IHandle;

		if (typeof position === 'string') {
			var placeholder:ui.IPlaceholder = this._placeholders[position];

			if (has('debug') && !placeholder) {
				throw new Error('Unknown placeholder "' + position + '"');
			}

			placeholder.set('body', widget);
			handle = {
				remove: function ():void {
					this.remove = function ():void {};
					placeholder.set('body', null);
					placeholder = null;
				}
			};
		}
		else if (position === PlacePosition.BEFORE) {
			handle = this._parent.add(widget, this.get('index'));
		}
		else if (position === PlacePosition.AFTER) {
			handle = this._parent.add(widget, this.get('index') + 1);
		}
		else {
			if (position === PlacePosition.ONLY) {
				this.empty();
				position = PlacePosition.FIRST;
			}

			if (position === PlacePosition.FIRST) {
				position = 0;
			}
			else if (position === PlacePosition.LAST) {
				position = this._children.length;
			}
			else {
				position = Math.max(0, Math.min(this._children.length, position));
			}

			var referenceWidget:ui.IDomWidget = this._children[position];
			this._children.splice(position, 0, widget);
			this._addToContainer(widget, referenceWidget);

			this.attach(widget);

			var self = this;
			handle = {
				remove: function ():void {
					this.remove = function ():void {};
					util.spliceMatch(self._children, widget);
					widget.detach();
					widget = self = null;
				}
			};
		}

		return handle;
	}

	/* protected */ _addToContainer(widget:ui.IDomWidget, reference:ui.IDomWidget):void;
	/* protected */ _addToContainer(widget:ui.IDomWidget, reference:Node):void;
	/* protected */ _addToContainer(widget:ui.IDomWidget, reference:any):void {
		var widgetNode:Node = widget.getNode(),
			referenceNode:Node;
		if (reference && !(reference instanceof Node)) {
			referenceNode = reference.get('firstNode');
		}
		else {
			referenceNode = reference;
		}

		// TODO: Allow users to specify a placeholder widget for use as the actual container for objects added to the
		// widget, a la Dijit `containerNode`?

		if (this._firstNode === this._lastNode) {
			this._firstNode.insertBefore(widgetNode, referenceNode);
		}
		else {
			this._firstNode.parentNode.insertBefore(widgetNode, referenceNode || this._lastNode);
		}
	}

	_createPlaceholder(name:string, node:Node):Placeholder {
		if (this._placeholders[name]) {
			throw new Error('Placeholder ' + name + ' already created');
		}
		var placeholder:Placeholder = this._placeholders[name] = new Placeholder(),
			parent:Node = node.parentNode;
		placeholder.set('parent', this);
		parent.replaceChild(placeholder.getNode(), node);
		placeholder.set('attached', true);
		return placeholder;
	}

	empty():void {
		var widget:ui.IDomWidget;
		while ((widget = this._children.pop())) {
			widget.detach();
		}

		for (var k in this._placeholders) {
			this._placeholders[k].set('body', null);
		}
	}

	remove(index:number):void;
	remove(widget:ui.IDomWidget):void;
	remove(index:any):void {
		var widget:ui.IDomWidget;

		if (typeof index !== 'number') {
			widget = index;

			if (has('debug') && widget !== this._children[widget.get('index')]) {
				throw new Error('Attempt to remove widget ' + widget.get('id') + ' from non-parent ' + this.get('id'));
			}

			index = widget.get('index');
		}
		else {
			widget = this._children[index];
		}

		widget.detach();
		this._children.splice(index, 1);
		// TODO: reset index on other children?
	}
}

export = DomWidgetContainer;
