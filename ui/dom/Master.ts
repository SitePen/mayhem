import ContentWidget = require('./ContentWidget');
import util = require('../../util');

class DomMaster extends ContentWidget {
	attachToWindow(node:Node):IHandle {
		node.appendChild(this.detach());
		this.set('attached', true);

		var self = this;
		return {
			remove: function ():void {
				this.set('attached', false);
				this.remove = function ():void {};
				self.detach();
				self = null;
			}
		};
	}
}

export = DomMaster;
