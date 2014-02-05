/// <reference path="../../../dojo" />

import core = require('../../../interfaces');
import SingleNodeWidget = require('../SingleNodeWidget');
import util = require('../../../util');

class Label extends SingleNodeWidget {
	private _binding:string;
	/* protected */ _firstNode:HTMLLabelElement;
	private _formattedText:string;
	private _for:string;
	/* protected */ _lastNode:HTMLLabelElement;
	private _text:string;

	// TODO: TS#2153
	// get(key:'binding'):string;
	// get(key:'formattedText'):string;
	// get(key:'for'):string;
	// get(key:'text'):string;
	// set(key:'binding', value:string):void;
	// set(key:'formattedText', value:string):void;
	// set(key:'for', value:string):void;
	// set(key:'text', value:'string'):void;

	constructor(kwArgs?:Object) {
		util.deferSetters(this, [ 'binding', 'formattedText', 'for', 'text' ], '_render');
		super(kwArgs);
	}

	/* protected */ _bindingSetter(value:string):void {
		this._binding = value;

		// TODO: Leaks, only works once.
		var proxty = this.get('app').get('binder').getMetadata<string>(this.get('mediator'), value, 'label');
		proxty.observe((label:string):void => {
			this.set('text', label);
		});
	}

	destroy():void {
		super.destroy();
	}

	/* protected */ _formattedTextSetter(value:string):void {
		this._formattedText = value;
		this._firstNode.innerHTML = value;
		// TODO: has-branch for old IE?
		this._text = this._firstNode.textContent || this._firstNode.innerText;
	}

	/* protected */ _forSetter(id:string):void {
		this._for = id;
		this._firstNode.htmlFor = id;
	}

	/* protected */ _render():void {
		this._firstNode = this._lastNode = document.createElement('label');
	}

	/* protected */ _textSetter(value:string):void {
		this._text = value;
		this._formattedText = util.escapeXml(value);
		this._firstNode.innerHTML = this._formattedText;
	}
}

export = Label;
