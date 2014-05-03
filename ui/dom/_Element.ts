import aria = require('./util/aria');
import array = require('dojo/_base/array');
import _BaseRenderer = require('./_Base');
import dom = require('./interfaces');
import domUtil = require('./util');
import has = require('../../has');
import on = require('dojo/on');
import PlacePosition = require('../PlacePosition');
import style = require('../style/interfaces');
import touch = require('dojo/touch');
import util = require('../../util');

class _ElementRenderer extends _BaseRenderer {
	tagName:string;

	attachContent(widget:dom.IElementWidget):void {
		var content = widget._innerFragment;
		if (content && content.firstChild) {
			widget._outerFragment.appendChild(content);
		}
		widget._innerFragment = null;
	}

	attachRole(widget:dom.IElementWidget):void {
		this._detachRole(widget);

		var element = widget._outerFragment,
			role = widget.get('role'),
			actions = this['_' + role + 'Actions'];

		element.setAttribute('role', widget.get('role'));

		if (!actions) {
			return has('debug') && console.warn('Renderer missing actions config for role: ' + role);
		}

		widget._actionHandles = [];
		for (var key in actions) {
			widget._actionHandles.push(actions[key].attach(widget));
		}

		// Patch up element tabindex depending on whether focus action is available
		if (actions.focus) {
			if (!(element.tabIndex >= 0)) {
				element.tabIndex = 0;
			}
		}
		else {
			if (element.tabIndex >= 0) {
				element.removeAttribute('tabindex');
			}
		}
	}

	attachStyles(widget:dom.IElementWidget):void {
		this._detachStyles(widget);

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

	render(widget:dom.IElementWidget):void {
		var node = document.createElement(this.tagName);
		node.id = widget.get('id');
		// If widget is already attached to a parent swap out the new widget
		var previousNode = widget._outerFragment;
		if (previousNode && previousNode.parentNode) {
			previousNode.parentNode.replaceChild(node, previousNode);
		}
		widget._firstNode = widget._lastNode = widget._outerFragment = node;

		this.attachStyles(widget);

		this._bindAttribute(widget, 'disabled', { attribute: 'aria-disabled' });
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

	updateVisibility(widget:dom.IFragmentWidget, value:boolean):void {
		// TODO: preserve previously set display style?
		widget.style.set('display', value ? '' : 'none');
	}
}

_ElementRenderer.prototype.tagName = 'div';

export = _ElementRenderer;
