import AddPosition = require('../AddPosition');
import CommonContainerMixin = require('../common/Container');
import IContainer = require('../Container');
import MultiNodeWidget = require('./MultiNodeWidget');
import Widget = require('./Widget');

class Container extends MultiNodeWidget implements IContainer {
	/**
	 * @protected
	 */
	_children:Widget[];

	get:Container.Getters;
	on:Container.Events;
	set:Container.Setters;

	constructor(kwArgs?:HashMap<any>) {
		super(kwArgs);
		CommonContainerMixin.apply(this, arguments);
	}

	_initialize():void {
		this._children = [];
		super._initialize();
	}

	add(child:Widget, position?:AddPosition):IHandle;
	add(child:Widget, position?:number):IHandle;
	add(child:Widget, position:any = AddPosition.LAST):IHandle {
		if (position === AddPosition.LAST) {
			position = this._children.length;
		}

		var nextWidget:Widget = this._children[position];
		var nextNode:Node = nextWidget ? nextWidget.get('firstNode') : this._lastNode;
		var parentNode:Node = nextNode || this._firstNode.parentNode;

		parentNode.insertBefore(child.detach(), nextNode);
		CommonContainerMixin.prototype.add.call(this, child);

		var self = this;
		return {
			remove: function ():void {
				this.remove = function ():void {};
				self.remove(child);
				self = child = null;
			}
		};
	}

	/**
	 * @protected
	 */
	_childrenGetter():Widget[] {
		return CommonContainerMixin.prototype._childrenGetter.apply(this, arguments);
	}

	/**
	 * @protected
	 */
	_childrenSetter(children:Widget[]):void {
		CommonContainerMixin.prototype._childrenSetter.apply(this, arguments);
	}

	destroy():void {
		this.empty();
		this._children = null;
		super.destroy();
	}

	empty():void {
		CommonContainerMixin.prototype.empty.apply(this, arguments);
	}

	getChildIndex(child:Widget):number {
		return CommonContainerMixin.prototype.getChildIndex.apply(this, arguments);
	}

	/**
	 * @protected
	 */
	_isAttachedSetter(value:boolean):void {
		CommonContainerMixin.prototype._isAttachedSetter.apply(this, arguments);
	}

	remove(index:number):void;
	remove(child:Widget):void;
	remove(index:any):void {
		var children = this._children;
		var widget:Widget;

		if (typeof index !== 'number') {
			widget = index;
			index = widget.get('index');

			if (widget !== children[index]) {
				throw new Error('Attempt to remove widget ' + widget.get('id') + ' from non-parent ' + this._id);
			}
		}
		else {
			widget = children[index];

			if (!widget) {
				throw new Error('No widget exists in container ' + this._id + ' at index ' + index);
			}
		}

		CommonContainerMixin.prototype.remove.call(this, children.splice(index, 1)[0]);
	}
}

module Container {
	export interface Events extends MultiNodeWidget.Events, IContainer.Events {}
	export interface Getters extends MultiNodeWidget.Getters, IContainer.Getters {}
	export interface Setters extends MultiNodeWidget.Setters, IContainer.Setters {}
}

export = Container;
