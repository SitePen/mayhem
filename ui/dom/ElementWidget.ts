import domUtil = require('./util');
import has = require('../../has');
import ui = require('../interfaces');
import Widget = require('../Widget');

class ElementWidget extends Widget implements ui.IElementWidget {
	/* protected */ _firstNode:HTMLElement;
	/* protected */ _lastNode:HTMLElement;
	/* protected */ _elementType:string;

	constructor(kwArgs:Object) {
		this._elementType = 'div';
		super(kwArgs);
	}

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

	detach():HTMLElement {
		// TODO: Make sure this is a reasonably logical thing to do; it introduces an inconsistency where
		// the widget is still parented in the widget tree but not in the DOM tree.
		this._firstNode.parentNode && this._firstNode.parentNode.removeChild(this._firstNode);
		return this._firstNode;
	}

	/* protected */ _render():void {
		this._firstNode = this._lastNode = document.createElement(this._elementType);
		this._attachStyles();
	}
}

export = ElementWidget;
