/// <reference path="../../dojo" />

import core = require('../../interfaces');
import dom = require('./interfaces');
import _ElementRenderer = require('./_Element');
import util = require('../../util');

class ListRenderer extends _ElementRenderer {
	itemTagName:string;

	destroy(widget:dom.IList):void {
		widget._observerHandle = util.remove(widget._observerHandle) && null;
		super.destroy(widget);
	}

	initialize(widget:dom.IList):void {
		super.initialize(widget);

		widget.observe('source', (source:any[], previous:any[]):void => {
			util.remove(widget._observerHandle);
			if (!source) {
				return this.clear(widget);
			}

			this._renderList(widget);

			// Observe source if it's a new ObservableArray
			if (typeof source['observe'] === 'function') {
				widget._observerHandle = source['observe'](():void => {
					this._renderList(widget);
				});
			}
		});
	}

	/* protected */ _renderItem(item:any):Node {
		var element = document.createElement(this.itemTagName);
		element.appendChild(document.createTextNode(item ? item.toString() : ''));
		return element;
	}

	private _renderList(widget:dom.IList):void {
		this.clear(widget);

		var fragment = document.createDocumentFragment(),
			source = widget.get('source') || [];
		for (var i = 0, item:any; (item = source[i]); i++) {
			fragment.appendChild(this._renderItem(item));
		}
		widget._firstNode.appendChild(fragment);
	}
}

ListRenderer.prototype.tagName = 'ul';
ListRenderer.prototype.itemTagName = 'li';

export = ListRenderer;
