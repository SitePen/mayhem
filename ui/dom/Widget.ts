import domUtil = require('./util');
import DomContainer = require('./Container');
import Widget = require('../Widget');
import widgets = require('../interfaces');

class DomWidget extends Widget implements widgets.IDomWidget {
	firstNode:Node;
	parent:DomContainer;
	lastNode:Node;

	constructor(kwArgs:Object) {
		super(kwArgs);

		var commentId:string = this.id.replace(/--/g, '\u2010\u2010');
		this.firstNode = document.createComment(commentId);
		this.lastNode = document.createComment('/' + commentId);
		// TODO: Do not expose the widget to the DOM to discourage people from dipping into it?
		this.firstNode['widget'] = this.lastNode['widget'] = this;
	}

	attachToDom(node:Element):void {
		node.appendChild(this.detach());
		this.parent = <DomContainer> <any> new DomWidget({});
		this.emit('attached');
	}

	detach():DocumentFragment {
		this.parent && this.parent.remove(this);
		return domUtil.getRange(this.firstNode, this.lastNode).extractContents();
	}

	destroy():void {
		super.destroy();
	}
}

export = DomWidget;
