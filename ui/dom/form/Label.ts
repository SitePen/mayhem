/// <reference path="../../../dojo" />

import core = require('../../../interfaces');
import SingleNodeWidget = require('../SingleNodeWidget');
import util = require('../../../util');

class Label extends SingleNodeWidget {
	binding:string;
	firstNode:HTMLLabelElement;
	formattedText:string;
	for:string;
	lastNode:HTMLLabelElement;
	text:string;

	constructor(kwArgs?:Object) {
		util.deferSetters(this, [ 'binding', 'formattedText', 'for', 'text' ], 'render');
		super(kwArgs);
	}

	/* protected */ _bindingSetter(value:string):void {
		this.binding = value;

		// TODO: Leaks, only works once.
		var proxty = <core.IProxty<string>> this.app.binder.getMetadata(this.get('mediator'), value, 'label');
		proxty.observe((label:string) => {
			this.set('text', label);
		});
	}

	destroy():void {
		super.destroy();
	}

	/* protected */ _formattedTextSetter(value:string):void {
		this.formattedText = value;
		this.firstNode.innerHTML = value;
		// TODO: has-branch for old IE?
		this.text = this.firstNode.textContent || this.firstNode.innerText;
	}

	/* protected */ _forSetter(id:string):void {
		this.for = id;
		this.firstNode.htmlFor = id;
	}

	render() {
		this.firstNode = this.lastNode = document.createElement('label');
	}

	/* protected */ _textSetter(value:string):void {
		this.text = value;
		this.formattedText = util.escapeXml(value);
		this.firstNode.innerHTML = this.formattedText;
	}
}

export = Label;
