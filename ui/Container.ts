import AddPosition = require('./AddPosition');
import core = require('../interfaces');
import has = require('../has');
import Mediated = require('./Mediated');
import PlacePosition = require('./PlacePosition');
import ui = require('./interfaces');
import util = require('../util');

class Container extends Mediated implements ui.IContainer {
	private _children:ui.IWidget[];

	constructor(kwArgs?:any) {
		this._children = [];
		super(kwArgs);
	}

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
			if (position === PlacePosition.ONLY) {
				this.empty();
				position = PlacePosition.FIRST;
			}
			if (position === PlacePosition.FIRST) {
				position = 0;
			}
			else if (position === PlacePosition.LAST) {
				position = this._children.length;
			}
			else {
				position = Math.max(0, Math.min(this._children.length, position));
			}

			item.detach();

			var referenceWidget:ui.IWidget = this._children[position];
			this._children.splice(position, 0, item);
			this._renderer.add(this, item, referenceWidget, position);
			//item.set('parent', this);
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
		var widget:ui.IWidget;
		while (this._children.length) {
			this.remove(this._children[0]);
		}
	}

	get:ui.IContainerGet;

	remove(index:number):void;
	remove(widget:ui.IWidget):void;
	remove(index:any):void {
		var widget:ui.IWidget;

		if (typeof index !== 'number') {
			widget = index;
			index = widget.get('index');

			if (has('debug') && widget !== this._children[index]) {
				throw new Error('Attempt to remove widget ' + widget.get('id') + ' from non-parent ' + this.get('id'));
			}
		}
		else {
			widget = this._children[index];
		}

		this._renderer.remove(this, widget);
		this._children.splice(index, 1);
		widget.set('parent', null);
	}

	set:ui.IContainerSet;
}

export = Container;
