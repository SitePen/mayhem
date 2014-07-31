import aspect = require('dojo/aspect');
import Container = require('../Container');
import Widget = require('../Widget');

class ContainerMixin {
	_children:Widget[];

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

	getIndexOfChild(child:Widget):number {
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
	}
}

export function applyTo(Ctor:Function):void {
	var prototype:Container = Ctor.prototype;

	for (var key in ContainerMixin.prototype) {
		if (prototype[key]) {
			aspect.after(prototype, key, ContainerMixin[key], true);
		}
		else {
			prototype[key] = ContainerMixin[key];
		}
	}
}

export function remove(child:Widget):void {
	child.set({
		attached: false,
		parent: null
	});
}
