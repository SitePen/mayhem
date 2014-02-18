import binding = require('../../binding/interfaces');
import core = require('../../interfaces');
import DomPlaceholder = require('./Placeholder');
import has = require('../../has');
import ObservableEvented = require('../../ObservableEvented');
import PlacePosition = require('../PlacePosition');
import util = require('../../util');
import MultiNodeWidget = require('./MultiNodeWidget');
import widgets = require('../interfaces');

class DomContainer extends MultiNodeWidget implements widgets.IContainer {
	/* protected */ _children:widgets.IDomWidget[];
	private _placeholders:{ [id:string]: DomPlaceholder; };

	constructor(kwArgs?:Object) {
		this._children || (this._children = []);
		this._placeholders || (this._placeholders = {});
		super(kwArgs);
	}

	// TS#2153
	// get(key:'children'):widget.IDomWidget[];
	// get(key:'placeholders'):{ [id:string]: DomPlaceholder; };

	add(widget:widgets.IDomWidget, position:PlacePosition):IHandle;
	add(widget:widgets.IDomWidget, position:number):IHandle;
	add(widget:widgets.IDomWidget, placeholder:string):IHandle;
	add(widget:widgets.IDomWidget, position:any = PlacePosition.LAST):IHandle {
		var handle:IHandle;

		if (typeof position === 'string') {
			var placeholder = this._placeholders[position];

			if (has('debug') && !placeholder) {
				throw new Error('Unknown placeholder "' + position + '"');
			}

			this[position] = widget;
			placeholder.set('content', widget);
			handle = {
				remove: function ():void {
					this.remove = function ():void {};
					placeholder.set('content', null);
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

			var referenceWidget:widgets.IWidget = this._children[position];
			this._children.splice(position, 0, widget);
			this._addToContainer(widget, referenceWidget);

			widget.set('parent', this);
			widget.emit('attached');

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

	/* protected */ _addToContainer(widget:widgets.IDomWidget, referenceWidget:widgets.IWidget):void {
		var widgetNode:Node = widget.detach(),
			referenceNode:Node = referenceWidget ? referenceWidget.get('firstNode') : null;

		// TODO: Allow users to specify a placeholder widget for use as the actual container for objects added to the
		// widget, a la Dijit `containerNode`?

		if (this._firstNode === this._lastNode) {
			this._firstNode.insertBefore(widgetNode, referenceNode);
		}
		else {
			this._firstNode.parentNode.insertBefore(widgetNode, referenceNode || this._lastNode);
		}
	}

	empty():void {
		var widget:widgets.IWidget;
		while ((widget = this._children.pop())) {
			widget.detach();
		}

		for (var k in this._placeholders) {
			this._placeholders[k].set('content', null);
		}
	}

	/* protected */ _mediatorSetter(mediator:core.IMediator):void {
		this._mediator = mediator;
		var child:widgets.IDomWidget;
		// Reset parentMediator on all children and remediate those that inherit parent mediator
		for (var i = 0, l = this._children.length; i < l; ++i) {
			child = this._children[i];
			child.set('parentMediator', mediator);
		}
		for (var k in this._placeholders) {
			child = this._placeholders[k];
			child.set('parentMediator', mediator);
		}
		super._mediatorSetter(mediator);
	}

	remove(index:number):void;
	remove(widget:widgets.IWidget):void;
	remove(index:any):void {
		var widget:widgets.IWidget;

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

export = DomContainer;
