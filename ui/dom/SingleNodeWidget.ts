import domUtil = require('./util');
import has = require('../../has');
import Widget = require('../Widget');
import widgets = require('../interfaces');

class SingleNodeWidget extends Widget implements widgets.IDomWidget {
	firstNode:HTMLElement;
	lastNode:HTMLElement;

	constructor(kwArgs?:Object) {
		super(kwArgs);
		this._render();
		this._attachStyles();
	}

	_attachStyles():void {
		// TODO: Leak
		this.classList.observe((className:string) => {
			this.firstNode.className = className;
		});

		this.style.observe((newValue:any, oldValue:any, key:string) => {
			if (has('debug') && key.indexOf('-') !== -1) {
				throw new Error('CSS properties in JavaScript are camelCase, not hyphenated');
			}

			domUtil.setStyle(this.firstNode, key, newValue);
		});
	}

	detach():HTMLElement {
		// TODO: Make sure this is a reasonably logical thing to do; it introduces an inconsistency where
		// the widget is still parented in the widget tree but not in the DOM tree.
		this.firstNode.parentNode && this.firstNode.parentNode.removeChild(this.firstNode);
		return this.firstNode;
	}

	/* protected */ _render():void {
		this.firstNode = this.lastNode = document.createElement('div');
	}
}

export = SingleNodeWidget;
