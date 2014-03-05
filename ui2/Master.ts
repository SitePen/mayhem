import DomView = require('./View');
import FragmentRenderer = require('./FragmentRenderer');

class DomMaster extends DomView {
	attachToWindow(node:Node):IHandle {
		this.detach();

		node.appendChild(this.get('fragment') || this.get('firstNode'));
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

DomMaster.prototype._renderer = new FragmentRenderer();

export = DomMaster;
