import ContentView = require('./ContentView');
import core = require('../interfaces');
import ui = require('./interfaces');

class Master extends ContentView implements ui.IMaster {
	/* protected */ _app:core.IApplication;
	/* protected */ _attachTo:any;

	add(item:ui.IWidget, position?:any):IHandle {
		var children = this.get('children');

		if (!children.length) {
			return super.add(item, position);
		}
		else {
			return (<ui.IContainer>children[0]).add(item, position);
		}
	}

	startup():void {
		this.startup = ():void => {};

		this._renderer.attachToWindow(this, this.get('attachTo'));
		this.set('attached', true);
	}
}
export = Master;
