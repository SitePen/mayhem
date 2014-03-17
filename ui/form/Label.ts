/// <reference path="../../dojo" />

import core = require('../../interfaces');
import Element = require('../Element');
import form = require('./interfaces');
import ui = require('../interfaces');
import util = require('../../util');

class Label extends Element implements form.ILabel {
	/* protected */ _values:form.ILabelArgs;

	constructor(kwArgs?:form.ILabelArgs) {
		util.deferSetters(this, [ 'for', 'text' ], '_render');
		this._renderOptions = { elementType: 'label' };
		super(kwArgs);
	}

	destroy():void {
		super.destroy();
	}

	/* protected */ _contentSetter(value:any/* string | Node */):void {
		super._contentSetter(value);
		this._values.text = this._renderer.getTextContent(this);
	}

	/* protected */ _forSetter(value:string):void {
		this._values.for = value;
		this._renderer.setAttribute(this, 'for', value);
	}

	/* protected */ _textSetter(value:string):void {
		this._values.text = value;
		this._values.formattedText = this._renderer.setBodyText(this, value);
	}
}

export = Label;
