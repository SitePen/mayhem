import DomWidget = require('./Widget');
import util = require('../../util');

class Label extends DomWidget {
	node:HTMLLabelElement = document.createElement('label');
	private _text:string;
	private _formattedText:string;
	// TODO: DomFormWidget?
	private _for:DomWidget;

	_textGetter():string {
		return this._text;
	}

	_textSetter(value:string):void {
		this._text = value;
		this._formattedText = util.escapeXml(value);
		this.node.innerHTML = this._formattedText;
	}

	_formattedTextGetter():string {
		return this._formattedText;
	}

	_formattedTextSetter(value:string):void {
		this._formattedText = value;
		this.node.innerHTML = value;
		// TODO: Branch for old IE?
		this._text = this.node.textContent || this.node.innerText;
	}

	_forGetter():DomWidget {
		return this._for;
	}

	_forSetter(widget:DomWidget):void {
		this._for = widget;
		this.node.htmlFor = widget.node.id;
	}

	destroy():void {

	}
}

export = Label;
