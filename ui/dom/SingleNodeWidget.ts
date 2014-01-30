import Widget = require('../Widget');
import widgets = require('../interfaces');

class SingleNodeWidget extends Widget implements widgets.IDomWidget {
	firstNode:Element;
	lastNode:Element;

	constructor(kwArgs:Object) {
		super(kwArgs);
		this.render();
	}

	detach():Element {
		super.detach();
		return this.firstNode;
	}

	render():void {
		this.firstNode = this.lastNode = document.createElement('div');
	}
}

export = SingleNodeWidget;
