import domUtil = require('../util');
import SingleNodeWidget = require('../SingleNodeWidget');
import widgets = require('../../interfaces');

class FormButton extends SingleNodeWidget {
	content:widgets.IDomWidget;
	firstNode:HTMLButtonElement;
	lastNode:HTMLButtonElement;
	type:string;
	value:string;

	private _childrenSetter(children:widgets.IDomWidget[]) {
		this.set('content', children && children[0]);
	}

	private _contentSetter(content:widgets.IDomWidget):void {
		if (content) {
			var range = domUtil.getRange(content.firstNode, content.lastNode);
			range.surroundContents(this.firstNode);
		}
		else {
			this.firstNode.innerHTML = '';
		}
	}

	destroy():void {
		this.firstNode.onclick = null;
		super.destroy();
	}

	// TODO: list (or map) of attributes to pass through to node?
	/* protected */ _render():void {
		this.firstNode = this.lastNode = document.createElement('button');
		if (this.type) {
			this.firstNode.setAttribute('type', this.type);
		}
		if (this.value) {
			this.firstNode.setAttribute('value', this.value);
		}
		// TODO: figure out how we should do actions
		this.firstNode.onclick = (event:Event):void => {
			console.log('CLICKY', this);
		};
	}

	private _typeSetter(value:string):void {
		this.type = value;
		if (this.firstNode) this.firstNode.setAttribute('type', value);
	}

	private _valueSetter(value:string):void {
		this.value = value;
		if (this.firstNode) this.firstNode.setAttribute('value', value);
	}
}

export = FormButton;
