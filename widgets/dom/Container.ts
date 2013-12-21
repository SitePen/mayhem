import DomPlaceholder = require('./Placeholder');
import DomWidget = require('./Widget');
import has = require('../../has');
import PlacePosition = require('../PlacePosition');
import StatefulArray = require('../../StatefulArray');
import widgets = require('../interfaces');

class DomContainer extends DomWidget implements widgets.IContainer {
	children:widgets.IDomWidget[] = [];
	placeholders:{ [id:string]: DomPlaceholder; } = {};

	add(widget:widgets.IDomWidget, position:PlacePosition):IHandle;
	add(widget:widgets.IDomWidget, position:number):IHandle;
	add(widget:widgets.IDomWidget, placeholder:string):IHandle;
	add(widget:widgets.IDomWidget, position:any = PlacePosition.LAST):IHandle {
		var handle:IHandle,
			node:Node = widget.detach(),
			referenceNode:Node;

		if (typeof position === 'string') {
			var placeholder = this.placeholders[position];

			if (has('debug') && !placeholder) {
				throw new Error('Unknown placeholder "' + position + '"');
			}

			this[position] = widget;
			placeholder.set('content', widget);
			handle = {
				remove: function () {
					this.remove = function () {};
					placeholder.set('content', null);
					placeholder = null;
				}
			};
		}
		else if (position === PlacePosition.BEFORE) {
			handle = this.parent.add(widget, this.index);
		}
		else if (position === PlacePosition.AFTER) {
			handle = this.parent.add(widget, this.index + 1);
		}
		else {
			if (position === PlacePosition.ONLY) {
				this.empty();
				position = PlacePosition.FIRST;
			}

			if (position === PlacePosition.FIRST) {
				// TODO: If firstNode equals lastNode then this is a single-node container, not a ranged container, and
				// we should be peeking into its children probably since otherwise this is going to place outside the
				// container.
				referenceNode = this.firstNode.nextSibling;
				position = 0;
			}
			else if (position === PlacePosition.LAST) {
				referenceNode = this.lastNode;
				position = this.children.length;
			}
			else {
				position = Math.max(0, Math.min(this.children.length, position));

				var referenceWidget:widgets.IDomWidget = this.children[position];
				referenceNode = referenceWidget ? referenceWidget.firstNode : this.lastNode;
			}

			this.children.splice(position, 0, widget);
			referenceNode.parentNode.insertBefore(node, referenceNode);
		}

		return handle;
	}

	empty():void {
		var widget:widgets.IWidget;
		while ((widget = this.children.pop())) {
			widget.detach();
		}

		for (var k in this.placeholders) {
			this.placeholders[k].set('content', null);
		}
	}

	remove(index:number):void;
	remove(widget:widgets.IWidget):void;
	remove(index:any):void {
		var widget:widgets.IWidget;

		if (typeof index !== 'number') {
			widget = index;

			if (has('debug') && widget !== this.children[widget.index]) {
				throw new Error('Attempt to remove widget ' + widget.id + ' from non-parent ' + this.id);
			}

			index = widget.index;
		}
		else {
			widget = this.children[index];
		}

		widget.detach();
		this.children.splice(index, 1);
	}
}

export = DomContainer;
