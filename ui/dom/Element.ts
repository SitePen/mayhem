import domConstruct = require('dojo/dom-construct');
import DomContainer = require('./Container');
import domUtil = require('./util');
import MultiNodeWidget = require('./MultiNodeWidget');
import PlacePosition = require('../PlacePosition');
import widgets = require('../interfaces');

/**
 * The Element class provides a DOM-specific widget that encapsulates one or more DOM nodes.
 */
class Element extends MultiNodeWidget {
	html:string;

	private _htmlSetter(html:string):void {
		this.html = html;

//		this.empty();
		domUtil.getRange(this.firstNode, this.lastNode, true).deleteContents();
		this.lastNode.parentNode.insertBefore(domConstruct.toDom(html), this.lastNode);
	}
}

export = Element;