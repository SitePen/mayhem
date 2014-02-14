import DomContainer = require('./Container');
import util = require('../../util');
import widgets = require('../interfaces');

class DomMaster extends DomContainer {
	attachToWindow(node:Node):IHandle {
		node.appendChild(this.detach());
		this.emit('attached');

		var self = this;
		return {
			remove: function ():void {
				this.remove = function ():void {};
				self.detach();
				self = null;
			}
		};
	}
}

export = DomMaster;
