import AddPosition = require('./AddPosition');
import array = require('dojo/_base/array');
import core = require('../interfaces');
import has = require('../has');
import Mediated = require('./Mediated');
import PlacePosition = require('./PlacePosition');
import ui = require('./interfaces');
import util = require('../util');

class Container extends Mediated implements ui.IContainer {
	private _children:ui.IWidget[];
	/* protected */ _values:ui.IContainerValues;

	constructor(kwArgs?:any) {
		this._children = [];
		super(kwArgs);
	}

	get:ui.IContainerGet;
	set:ui.IContainerSet;

	add(item:ui.IWidget, position?:AddPosition):IHandle;
	add(item:ui.IWidget, position?:number):IHandle;
	add(item:ui.IWidget, position?:any):IHandle;
	add(item:ui.IWidget, position:any = PlacePosition.LAST):IHandle {
		var handle:IHandle;

		if (position === PlacePosition.BEFORE) {
			handle = this.get('parent').add(item, this.get('index'));
		}
		else if (position === PlacePosition.AFTER) {
			handle = this.get('parent').add(item, this.get('index') + 1);
		}
		else {
			var children = this._children;
			if (position === PlacePosition.ONLY) {
				this.empty();
				position = PlacePosition.FIRST;
			}
			if (position === PlacePosition.FIRST) {
				position = 0;
			}
			else if (position === PlacePosition.LAST) {
				position = children.length;
			}
			else {
				position = Math.max(0, Math.min(children.length, position));
			}

			var referenceWidget:ui.IWidget = children[position];
			children.splice(position, 0, item);
			this._renderer.add(this, item, referenceWidget);
			item.set('parent', this);

			var self = this;
			handle = {
				remove: function ():void {
					this.remove = function ():void {};
					self.remove(item);
					handle = item = self = null;
				}
			};
		}

		return handle;
	}

	/* protected */ _attachedSetter(attached:boolean):void {
		// Propagate attachment information to children
		var children = this._children;
		for (var i = 0, child:ui.IWidget; (child = children[i]); ++i) {
			child.set('attached', attached);
		}
		super._attachedSetter(attached);
	}

	/* protected */ _childrenGetter():ui.IWidget[] {
		// Copy children array to avoid issues with mutation
		return array.map(this._children, (child:ui.IWidget) => child);
	}

	/* protected */ _childrenSetter(children:ui.IWidget[]):void {
		this.empty();
		for (var i = 0, child:ui.IWidget; (child = children[i]); ++i) {
			this.add(child, i);
		}
	}

	destroy():void {
		this.empty();
		this._children = null;
	}

	empty():void {
		var children = this._children;
		while (children.length) {
			children.pop().detach()
		}
		children = null;
	}

	getChild(index:number):ui.IWidget {
		return this._children[index];
	}

	getChildIndex(item:ui.IWidget):number {
		return this._children.indexOf(item);
	}

	nextChild(item:ui.IWidget):ui.IWidget {
		var index = this.getChildIndex(item);
		return index === -1 ? null : this._children[index + 1];
	}

	previousChild(item:ui.IWidget):ui.IWidget {
		var index = this.getChildIndex(item);
		return index === -1 ? null : this._children[index - 1];
	}

	remove(index:number):void;
	remove(widget:ui.IWidget):void;
	remove(index:any):void {
		var children = this._children,
			widget:ui.IWidget;

		if (typeof index !== 'number') {
			widget = index;
			index = widget.get('index');

			if (has('debug') && widget !== children[index]) {
				throw new Error('Attempt to remove widget ' + widget.get('id') + ' from non-parent ' + this.get('id'));
			}
		}
		else {
			widget = children[index];
		}

		this._renderer.remove(this, widget);
		children.splice(index, 1);
		widget.set('parent', null);
	}
}

export = Container;
