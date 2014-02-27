import binding = require('../../binding/interfaces');
import core = require('../../interfaces');
import has = require('../../has');
import FragmentWidget = require('./FragmentWidget');
import ObservableEvented = require('../../ObservableEvented');
import PlacePosition = require('../PlacePosition');
import ui = require('../interfaces');
import util = require('../../util');

class ContentWidget extends FragmentWidget implements ui.IWidgetContainer { // ui.IContentWidget
	/* protected */ _children:ui.IDomWidget[];
	private _placeholders:{ [name:string]: ui.IPlaceholder; }; // TOOD: move to IPlaceholdingContainer

	constructor(kwArgs?:Object) {
		this._children || (this._children = []);
		this._placeholders || (this._placeholders = {});
		super(kwArgs);
	}

	add(widget:ui.IDomWidget, position:PlacePosition):IHandle;
	add(widget:ui.IDomWidget, position:number):IHandle;
	add(widget:ui.IDomWidget, placeholder:string):IHandle;
	add(widget:ui.IDomWidget, position:any = PlacePosition.LAST):IHandle {
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

			var referenceWidget:ui.IDomWidget = this._children[position];
			this._children.splice(position, 0, widget);
			this._addToContainer(widget, referenceWidget);

			widget.set('parent', this);

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

	/* protected */ _addToContainer(widget:ui.IDomWidget, referenceWidget:ui.IDomWidget):void {
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
		var widget:ui.IDomWidget;
		while ((widget = this._children.pop())) {
			widget.detach();
		}

		for (var k in this._placeholders) {
			this._placeholders[k].set('content', null);
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

export = ContentWidget;
