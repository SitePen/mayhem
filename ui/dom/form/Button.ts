import SingleNodeWidget = require('../SingleNodeWidget');
import domUtil = require('../util');

class Button extends SingleNodeWidget {
	firstNode:HTMLButtonElement;
	lastNode:HTMLButtonElement;
	value:string;

	destroy():void {
		this.firstNode.onclick = null;
		super.destroy();
	}

	render():void {
		this.firstNode = this.lastNode = document.createElement('button');
		this.firstNode.onclick = (event:Event):void => {
			console.log('CLICKY', this)
		};
	}

	_valueSetter(value:string):void {
		this.value = this.firstNode.value = value;
	}

	setContent(children:any) {
		// TODO: for now we assume children is a 1 element MultiNodeWidget
		var child = children[0];
		var range = domUtil.getRange(child.firstNode, child.lastNode);
		range.surroundContents(this.firstNode);
	}
}

export = Button;
