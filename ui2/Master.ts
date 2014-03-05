/// <amd-dependency path="./renderer!Placeholder" />
declare var require:any;

import dom = require('./interfaces');
var Renderer = require('./renderer!Placeholder');
import View = require('./View');

class Master extends View {
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

Master.prototype._renderer = new Renderer();

export = Master;
