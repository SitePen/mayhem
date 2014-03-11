import ui = require('./interfaces');
import View = require('./View');

class Master extends View implements ui.IMaster {
	attachToWindow(window:any):IHandle {
		this.detach();

		this._renderer.attachToWindow(this, window);
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
export = Master;
