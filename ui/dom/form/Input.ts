import SingleNodeWidget = require('../SingleNodeWidget');

class Input extends SingleNodeWidget {
	firstNode:HTMLInputElement;
	lastNode:HTMLInputElement;
	value:string;

	destroy():void {
		this.firstNode.oninput = null;
		super.destroy();
	}

	render():void {
		this.firstNode = this.lastNode = document.createElement('input');
		this.firstNode.oninput = (event:Event):void => {
			this.set('value', this.firstNode.value);
		};
	}

	_valueSetter(value:string):void {
		this.value = this.firstNode.value = value;
	}
}

export = Input;
