import ViewWidget = require('./ViewWidget');
import util = require('../../util');

class DomMaster extends ViewWidget {
	attachToWindow(node:Node):IHandle {
		node.appendChild(this.getNode());
		this.set('attached', true);

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
