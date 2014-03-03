/// <reference path="../../dojo" />

import core = require('../../interfaces');
import dijit = require('./interfaces');
import _Dijit = require('./_Dijit');
import has = require('../../has');
import PlacePosition = require('../PlacePosition');
import ui = require('../interfaces');

/* abstract */ class _DijitContainer extends _Dijit {
	/* protected */ _dijit:dijit.IContainerWidget;

	add(widget:ui.IDomWidget, position:any):IHandle {
		// We only support adding children to dijits by index for now
		if (!(widget instanceof _Dijit)) {
			throw new Error('Only Dijit instances can be added to Dijit container');
		}
		position || (position = 0);
		if (typeof position === 'number' && position >= 0) {
			widget.set('parent', this);
			this.get('children')[position] = widget;
			this._dijit.addChild((<_Dijit> widget)._dijit, position);
			return; // TODO: IHandle
		}
		if (has('debug')) {
			throw new Error('NYI');
		}
	}

	clear():void {
		this._dijit.containerNode.innerHTML = '';
	}

	/* protected */ _placeContent():void {
		this.clear();
		this._dijit.containerNode.appendChild(this._content);
	}
}

_DijitContainer.configure(_Dijit);

export = _DijitContainer;
