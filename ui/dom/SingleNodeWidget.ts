import Widget = require('../Widget');
import widgets = require('../interfaces');

class SingleNodeWidget extends Widget implements widgets.IDomWidget {
	firstNode:Element;
	lastNode:Element;

	constructor(kwArgs:Object) {
		super(kwArgs);
		this.firstNode = this.lastNode = document.createElement('div');
	}

	detach():Element {
		super.detach();
		return this.firstNode;
	}
}

export = SingleNodeWidget;
