import ContentView = require('./ContentView');
import ui = require('./interfaces');

class Master extends ContentView implements ui.IMaster {
	attachToWindow(target:any):IHandle {
		this._renderer.detach(this);

		this._renderer.attachToWindow(this, target);
		this.set('attached', true);

		var self = this;
		return {
			remove: function ():void {
				this.remove = function ():void {};
				self._renderer.detach(self);
				this.set('attached', false);
				self = null;
			}
		};
	}
}
export = Master;
