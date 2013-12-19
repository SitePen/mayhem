import has = require('../../has');
import PlacePosition = require('../PlacePosition');
import StatefulArray = require('../../StatefulArray');
import Widget = require('./Widget');
import widgets = require('../interfaces');

class Container extends Widget implements widgets.IContainer {
	children:StatefulArray<widgets.IWidget>;

	add(widget:widgets.IWidget, position:any):IHandle {
		if (typeof position === 'string') {
			var placeholder = this.placeholders[position];

			if (has('debug') && !placeholder) {
				throw new Error('No such placeholder "' + position + '"');
			}

			placeholder.set(widget);
		}

		var container = this._containerNode,
			children = container.children;

		var referenceNode;
		if (position === PlacePosition.FIRST) {
			referenceNode = children[0];
		}
		else if (position === PlacePosition.LAST) {
			referenceNode = null;
		}
		else if (position >= 0) {
			referenceNode = children[position];
		}
		else if (has('debug')) {
			throw new Error('Cannot set position to ' + (PlacePosition[position] || position));
		}

		if (widget.get('parent')) {
			widget.get('parent').remove(widget);
		}

		this._containerNode.insertBefore(widget.get('node'), referenceNode);

		var self = this;
		return {
			remove: function () {

			}
		};
	}
}

export = Container;
