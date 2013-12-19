import domUtil = require('./util');
import widgets = require('../interfaces');

class Placeholder extends Widget {
	private _startNode:Comment;
	private _endNode:Comment;

	content:widgets.IWidget;

	constructor() {
		this._startNode = document.createComment(this.id);
		this._endNode = document.createComment('/' + this.id);
	}

	placeAt(container:widgets.IContainer, position:any):IHandle {
		var fragment = document.createDocumentFragment();
		fragment.appendChild(this._startNode);
		fragment.appendChild(this._endNode);
		container.addNode(fragment, position);

		var self = this;
		return {
			remove: function () {
				this.remove = function () {};
				domUtil.getRange(self._startNode, self._endNode).deleteContents();
			}
		};
	}

	set(widget:widgets.IWidget) {
		domUtil.getRange(this._startNode, this._endNode).deleteContents();

		if (widget && this._endNode) {
			this._endNode.parentNode.insertBefore(widgets.node, this._endNode);
		}
	}
}

export = Placeholder;
