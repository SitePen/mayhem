import ContentComponent = require('./ContentComponent');
import util = require('../../util');
import widgets = require('../interfaces');

class DomMaster extends ContentComponent {
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
