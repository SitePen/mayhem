import DomClassList = require('./ClassList');
import Widget = require('../Widget');
import widgets = require('../interfaces');

class SingleNodeWidget extends Widget implements widgets.IDomWidget {
	classList:DomClassList;
	firstNode:Element;
	lastNode:Element;

	constructor(kwArgs?:Object) {
		super(kwArgs);
		this.render();
		this.classList = new DomClassList(this);
	}

	detach():Element {
		return this.firstNode;
	}

	render():void {
		this.firstNode = this.lastNode = document.createElement('div');
	}
}

export = SingleNodeWidget;
