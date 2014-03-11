/// <reference path="../../dojo" />

import core = require('../../interfaces');
import Element = require('../Element');
import form = require('./interfaces');
import ui = require('../interfaces');
import util = require('../../util');

class Label extends Element implements form.ILabel {
	private _formattedText:string;
	private _for:string;
	private _text:string;

	// private _firstNode:HTMLLabelElement;
	// private _lastNode:HTMLLabelElement;

	// TODO: TS#2153
	// get(key:'formattedText'):string;
	// get(key:'for'):string;
	// get(key:'text'):string;
	// set(key:'formattedText', value:string):void;
	// set(key:'for', value:string):void;
	// set(key:'text', value:'string'):void;

	constructor(kwArgs?:Object) {
		util.deferSetters(this, [ 'for', 'text' ], '_render');
		this._renderOptions = { elementType: 'label' };
		super(kwArgs);
	}

	destroy():void {
		super.destroy();
	}

	/* protected */ _contentSetter(value:any/* string | Node */):void {
		super._contentSetter(value);
		this._text = this._renderer.getTextContent(this);
	}

	/* protected */ _forSetter(id:string):void {
		this._for = id;
		this._renderer.setAttribute(this, 'for', id);
	}

	/* protected */ _textSetter(value:string):void {
		this._text = value;
		this._formattedText = this._renderer.setBodyText(this, value);
	}
}

export = Label;
