import SingleNodeWidget = require('../SingleNodeWidget');
import domUtil = require('../util');

class Button extends SingleNodeWidget {
	firstNode:HTMLButtonElement;
	lastNode:HTMLButtonElement;
	value:string;

	constructor(kwArgs:any) {
		var newArgs = {};
		for (var key in kwArgs) {
			if (key === 'children' || key === 'value') continue;
			newArgs[key] = kwArgs[key];
		}
		super(newArgs);
		// TODO: this is shite
		if (kwArgs.children && kwArgs.children[0]) this._setChildElement(kwArgs.children[0]);
		this.set('value', kwArgs.value);
	}

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

	private _setChildElement(child:any /* Element */) {
		var range = domUtil.getRange(child.firstNode, child.lastNode);
		range.surroundContents(this.firstNode);
	}
}

export = Button;
