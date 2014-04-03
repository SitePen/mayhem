import array = require('dojo/_base/array');
import dom = require('./interfaces');
import domUtil = require('./util');
import on = require('dojo/on');
import PlacePosition = require('../PlacePosition');
import style = require('../style/interfaces');
import touch = require('dojo/touch');
import ui = require('../interfaces');
import util = require('../../util');
import WidgetRenderer = require('./Widget');

class DomElementRenderer extends WidgetRenderer {
	elementType:string;

	attachContent(widget:dom.IElementWidget):void {
		var content = widget._innerFragment;
		if (content && content.firstChild) {
			widget._outerFragment.appendChild(content);
		}
		widget._innerFragment = null;
	}

	attachStyles(widget:dom.IElementWidget):void {
		this.detachStyles(widget);

		widget._classListHandle = widget.classList.observe((value:string):void => {
			widget._outerFragment.className = value;
		});

		widget._styleHandle = widget.style.observe((value:any, previous:any, key:string):void => {
			domUtil.setStyle(widget._outerFragment, key, value);
		});
	}

	/* protected */ _bindAttribute(widget:dom.IElementWidget, property:string, options:any = {}):void {
		var attribute = options.attribute || property;
		var value:any = widget.get(property);
		value && widget._firstNode.setAttribute(attribute, value);
		widget.observe(property, (value:any):void => {
			if (value == null) {
				widget._firstNode.removeAttribute(attribute);
			}
			else {
				widget._firstNode.setAttribute(attribute, value);
			}
		});
	}

	clear(widget:dom.IElementWidget):void {
		widget._outerFragment.innerHTML = '';
		widget._innerFragment = null;
	}

	detach(widget:dom.IElementWidget):void {
		var node = widget._outerFragment;
		node.parentNode && node.parentNode.removeChild(node);
	}

	detachContent(widget:dom.IElementWidget):void {
		var node = widget._outerFragment;
		widget._innerFragment = domUtil.extractRange(node.firstChild, node.lastChild);
	}

	initialize(widget:dom.IElementWidget):void {
		super.initialize(widget);

		widget.observe('on', (subscriptions:any):void => {
			// TODO: handle more than one set call sanely
			array.forEach(util.getObjectKeys(subscriptions), (type:string) => {
				on(widget._firstNode, touch[type], (event:Event):void => {
					var method = subscriptions[type],
						mediator = widget.get('mediator');
					mediator && mediator[method] && mediator[method](event);
				});
			});
		});
	}

	render(widget:dom.IElementWidget):void {
		var node = document.createElement(this.elementType);
		node.id = widget.get('id');
		// If widget is already attached to a parent swap out the new widget
		var previousNode = widget._outerFragment;
		if (previousNode && previousNode.parentNode) {
			previousNode.parentNode.replaceChild(node, previousNode);
		}
		widget._firstNode = widget._lastNode = widget._outerFragment = node;
		this.attachStyles(widget);

		this._bindAttribute(widget, 'accesskey');
		this._bindAttribute(widget, 'role');
		this._bindAttribute(widget, 'spellcheck');
		this._bindAttribute(widget, 'tabindex');
		this._bindAttribute(widget, 'title');
	}

	setContent(widget:dom.IElementWidget, value?:any /* string | Node */):void {
		if (typeof value === 'string') {
			widget._outerFragment.innerHTML = value;
		}
		else {
			this.clear(widget);
			value && widget._outerFragment.appendChild(value);
		}
	}
}

DomElementRenderer.prototype.elementType = 'div';

export = DomElementRenderer;
