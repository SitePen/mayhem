import AddPosition = require('./AddPosition');
import has = require('../has');
import PlacePosition = require('./PlacePosition');
import Widget = require('./Widget');

class Container extends Widget {
	private _children:Widget[];

	constructor(kwArgs?:any) {
		this._children = [];
		super(kwArgs);
	}

	get:Container.Getters;
	set:Container.Setters;

	add(item:Widget, position?:AddPosition):IHandle;
	add(item:Widget, position?:number):IHandle;
	add(item:Widget, position?:any):IHandle;
	add(item:Widget, position:any = PlacePosition.LAST):IHandle {
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

			children.splice(position, 0, item);
			this._renderer.add(item, position);
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

	/**
	 * Propagates information on whether or not the content is part of an attached view to children.
	 * @protected
	 */
	_attachedSetter(value:boolean):void {
		var children = this._children;
		for (var i = 0, child:Widget; (child = children[i]); ++i) {
			child.set('attached', value);
		}
	}

	/**
	 * @protected
	 */
	_childrenGetter():Widget[] {
		// Copy children array to avoid issues with mutation
		return this._children.slice(0);
	}

	/**
	 * @protected
	 */
	_childrenSetter(children:Widget[]):void {
		this.empty();
		for (var i = 0, child:Widget; (child = children[i]); ++i) {
			this.add(child);
		}
	}

	destroy():void {
		this.empty();
		this._children = null;
		super.destroy();
	}

	empty():void {
		var children = this._children;
		while (children.length) {
			this.remove(children[0]);
		}
	}

	remove(value:number):void;
	remove(value:Widget):void;
	remove(value:any):void {
		var children = this._children;
		var widget:Widget;

		if (typeof value !== 'number') {
			widget = value;
			value = widget.get('index');

			if (has('debug') && widget !== children[value]) {
				throw new Error('Attempt to remove widget ' + widget.get('id') + ' from non-parent ' + this._id);
			}
		}
		else {
			widget = children[value];
		}

		this._renderer.remove(widget);
		children.splice(value, 1);
		widget.set({
			attached: false,
			parent: null
		});
	}
}

module Container {
	export interface Getters extends Widget.Getters {}
	export interface Setters extends Widget.Setters {}
}

export = Container;
