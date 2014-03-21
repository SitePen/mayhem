import AddPosition = require('./AddPosition');
import core = require('../interfaces');
import has = require('../has');
import Mediated = require('./Mediated');
import PlacePosition = require('./PlacePosition');
import ui = require('./interfaces');
import util = require('../util');

class Container extends Mediated implements ui.IContainer {
	/* protected */ _values:ui.IContainerValues;

	constructor(kwArgs:any = {}) {
		kwArgs.children || (kwArgs.children = []);
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
			var children = this.get('children');
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

			item.detach();

			var referenceWidget:ui.IWidget = children[position];
			children.splice(position, 0, item);
			this._renderer.add(this, item, referenceWidget);
			this.attach(item);

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

	// destroy():void {
	// 	// TODO: what to do about children?
	// 	super.destroy();
	// }

	empty():void {
		var children = this.get('children'),
			widget:ui.IWidget;
		while (children.length) {
			this.remove(children[0]);
		}
	}

	remove(index:number):void;
	remove(widget:ui.IWidget):void;
	remove(index:any):void {
		var children = this.get('children'),
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
