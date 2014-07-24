import AddPosition = require('../AddPosition');
import BaseContainer = require('../Container');
import CommonContainerMixin = require('../common/Container');
import MultiNodeWidget = require('./MultiNodeWidget');
import Widget = require('./Widget');

class Container extends MultiNodeWidget implements BaseContainer {
	private _children:Widget[];

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

		var self = this;
		return {
			remove: function ():void {
				this.remove = function ():void {};
				self.remove(child);
				self = child = null;
			}
		};

		// implemented by CommonContainerMixin
	}

	empty():void {
		// implemented by CommonContainerMixin
	}

	getIndexOf(child:Widget):number {
		// implemented by CommonContainerMixin
		return undefined;
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

		children.splice(index, 1);

		// implemented by CommonContainerMixin
	}
}

CommonContainerMixin.applyTo(Container);

module Container {
	export interface Events extends Widget.Events, BaseContainer.Events {}
	export interface Getters extends Widget.Getters, BaseContainer.Getters {}
	export interface Setters extends Widget.Setters, BaseContainer.Setters {}
}

export = Container;
