import aspect = require('dojo/aspect');
import Container = require('../Container');
import Widget = require('../Widget');

class ContainerMixin {
	private _children:Widget[];
	private _isAttached:boolean;

	get:Widget.Getters;

	add(child:Widget):void {
		child.set({
			isAttached: this.get('isAttached'),
			parent: this
		});
	}

	/**
	 * @protected
	 */
	_childrenGetter():Widget[] {
		// Make a copy of the children array to avoid end-users being able to mutate the internal array, since this
		// would lead to leaks in most cases
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
	}

	empty():void {
		var children:Widget[] = this._children;
		var child:Widget;
		while ((child = children.pop())) {
			child.destroy();
		}
	}

	getChildIndex(child:Widget):number {
		var children:Widget[] = this._children;

		for (var i = 0, maybeChild:Widget; (maybeChild = children[i]); ++i) {
			if (maybeChild === child) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * @protected
	 */
	_isAttachedSetter(value:boolean):void {
		var children:Widget[] = this._children;
		for (var i = 0, child:Widget; (child = children[i]); ++i) {
			child.set('isAttached', value);
		}
		this._isAttached = value;
	}

	remove(child:Widget):void {
		child.set({
			attached: false,
			parent: null
		});
	}
}

export = ContainerMixin;
