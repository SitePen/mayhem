import domUtil = require('./util');
import ui = require('../interfaces');
import Widget = require('../Widget');

/* abstract */ class DomWidget extends Widget implements ui.IDomWidget {
	private _attachedWidgets:ui.IDomWidget[];
	/* protected */ _firstNode:Node;
	/* protected */ _lastNode:Node;

	constructor(kwArgs?:any) {
		this._attachedWidgets = [];
		super(kwArgs);
	}

	// Set widget parent and bind widget's attached state to parent's
	attach(widget:ui.IDomWidget):void {
		this._attachedWidgets.push(widget);
		widget.set('parent', this);
		widget.set('attached', this.get('attached'));
	}

	/* protected */ _attachedSetter(attached:boolean):void {
		var widget:ui.IDomWidget;
		for (var i = 0; (widget = this._attachedWidgets[i]); ++i) {
			widget.set('attached', attached);
		}
		super._attachedSetter(attached);
	}

	// TODO: should clear return the fragment of the stripped content?
	clear():void {}

	detach():void {
		// super.detach does some other things we don't want (yet) so don't call
		this.set('attached', false);
	}

	getNode():Node {
		this.detach();
		return this._firstNode === this._lastNode ? this._firstNode : this.get('fragment');
	}
}

export = DomWidget;
