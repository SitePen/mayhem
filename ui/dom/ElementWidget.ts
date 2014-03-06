import domUtil = require('./util');
import DomWidget = require('./DomWidget');
import has = require('../../has');
import ui = require('../interfaces');

class ElementWidget extends DomWidget implements ui.IElementWidget {
	/* protected */ _elementType:string;
	/* protected */ _firstNode:HTMLElement;
	/* protected */ _lastNode:HTMLElement;

	_attachStyles():void {
		// TODO: Leak
		this.get('classList').observe((className:string):void => {
			this._firstNode.className = className;
		});

		this.get('style').observe((newValue:ui.IStyle, oldValue:ui.IStyle, key:string):void => {
			if (has('debug') && key.indexOf('-') !== -1) {
				throw new Error('CSS properties in JavaScript are camelCase, not hyphenated');
			}

			domUtil.setStyle(this._firstNode, key, newValue);
		});
	}

	_replaceRoot(node:HTMLElement):HTMLElement {
		if (node !== this._firstNode) {
			var previous:HTMLElement = <HTMLElement> this._firstNode.parentNode.replaceChild(node, this._firstNode);
			this._firstNode = this._lastNode = node;
			this.get('classList').set(node.className);
			return previous;
		}
	}

	clear():void {
		this._firstNode.innerHTML = '';
	}

	detach():void {
		// TODO: Make sure this is a reasonably logical thing to do; it introduces an inconsistency where
		// the widget is still parented in the widget tree but not in the DOM tree.
		this._firstNode.parentNode && this._firstNode.parentNode.removeChild(this._firstNode);
		super.detach();
	}

	/* protected */ _render():void {
		// TODO: find a clean way to default _elementType when using ElementWidget as a mixin
		this._firstNode = this._lastNode = document.createElement(this._elementType);
		this._attachStyles();

		super._render();
	}
}

ElementWidget.prototype._elementType = 'div';

export = ElementWidget;
