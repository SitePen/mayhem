import DomContainer = require('./Container');
import MultiNodeWidget = require('./MultiNodeWidget');
import PlacePosition = require('../PlacePosition');
import util = require('../../util');
import widgets = require('../interfaces');

class DomMaster extends MultiNodeWidget implements widgets.IContainer {
	children:widgets.IWidget[] = [];
	placeholders:{ [id:string]:widgets.IPlaceholder } = {};

	attachToWindow(node:Node):IHandle {
		node.appendChild(this.detach());
		this.emit('attach');

		var self = this;
		return {
			remove: function ():void {
				this.remove = function ():void {};
				self.detach();
				self = null;
			}
		};
	}

	// widgets.IContainer
	add:{
		(widget:widgets.IDomWidget, position:PlacePosition):IHandle;
		(widget:widgets.IDomWidget, position:number):IHandle;
		(widget:widgets.IDomWidget, placeholder:string):IHandle;
	};

	// empty:() => void;

	remove:{ (index:number):void; (widget:widgets.IWidget):void; };
}

util.applyMixins(DomMaster, [ DomContainer ]);

export = DomMaster;
