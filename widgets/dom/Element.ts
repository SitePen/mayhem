import domConstruct = require('dojo/dom-construct');
import DomWidget = require('./Widget');
import PlacePosition = require('../PlacePosition');
import widgets = require('../interfaces');

/**
 * The Element class provides a DOM-specific widget that encapsulates one or more DOM nodes.
 */
class Element extends DomWidget implements widgets.IDomContainer {
	_startNode:Comment;
	_endNode:Comment;
	html:string;

	constructor(kwArgs:Object) {
		super(kwArgs);
	}

	// TODO: Perhaps this type only supports placeholders.
	add(widget:widgets.IWidget, position:PlacePosition):IHandle;
	add(widget:widgets.IWidget, position:number):IHandle;
	add(widget:widgets.IWidget, placeholder:string):IHandle;
	add(widget:widgets.IWidget, position:any = PlacePosition.LAST):IHandle {

	}

	destroy() {
		this.destroy = function () {};

		var range = this._getRange();
		range && range.deleteContents();
		this._startNode = this._endNode = null;
	}

	getChildIndex(child:IWidget):number {

	}

	private _getFragment():DocumentFragment {
		var range;
		if ((range = this._getRange())) {
			return range.extractContents();
		}
		else {
			var fragment = domConstruct.toDom(this.html);
			if (fragment.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
				var node = fragment;
				fragment = document.createDocumentFragment();
				fragment.appendChild(node);
			}

			this._startNode = fragment.firstChild;
			this._endNode = fragment.lastChild;

			return fragment;
		}
	}

	private _getRange():Range {
		if (this._startNode) {
			var range = document.createRange();
			range.setStartBefore(this._startNode);
			range.setEndAfter(this._endNode);
			return range;
		}
	}

	placeAt(container:widgets.IContainer, positionOrPlaceholder:any):IHandle {
		var fragment = this._getFragment();
		return container.addNode(fragment, positionOrPlaceholder);
	}
}

export = Element;
