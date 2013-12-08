import DomWidget = require('./Widget');
import has = require('../../has');
import util = require('../../util');

class Label extends DomWidget {
	/* protected */ _node:HTMLLabelElement;
	text:string;
	formattedText:string;
	for:string;

	constructor(kwArgs:Object) {
		super(kwArgs);
		this._node = document.createElement('label');
	}

	_textSetter(value:string):void {
		this.text = value;
		this.formattedText = util.escapeXml(value);
		this._node.innerHTML = this.formattedText;
	}

	_formattedTextSetter(value:string):void {
		this.formattedText = value;
		this._node.innerHTML = value;
		// TODO: has-branch for old IE?
		this.text = this._node.textContent || this._node.innerText;
	}

	_forSetter(id:string):void {
		this.for = id;
		this._node.htmlFor = id;
	}

	destroy():void {
		super.destroy();
		this.for = this.text = this.formattedText = null;
	}
}

export = Label;
