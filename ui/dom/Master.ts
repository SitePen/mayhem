import DomContainer = require('./Container');
import MultiNodeWidget = require('./MultiNodeWidget');
import PlacePosition = require('../PlacePosition');
import widgets = require('../interfaces');

class DomMaster extends MultiNodeWidget implements widgets.IContainer {
	children:widgets.IWidget[] = [];
	placeholders:{ [id:string]:widgets.IPlaceholder } = {};

	add:{
		(widget:widgets.IDomWidget, position:PlacePosition):IHandle;
		(widget:widgets.IDomWidget, position:number):IHandle;
		(widget:widgets.IDomWidget, placeholder:string):IHandle;
	};

	attachToWindow(node:Node, position:PlacePosition):IHandle {
		var self = this;
		return {
			remove: function () {
				this.remove = function () {};
				self.detach();
				self = null;
			}
		}
	}

	empty:() => void;
	remove:{ (index:number):void; (widget:widgets.IWidget):void; };
}
DomMaster.prototype.add = DomContainer.prototype.add;
DomMaster.prototype.empty = DomContainer.prototype.empty;
DomMaster.prototype.remove = DomContainer.prototype.remove;

export = DomMaster;
