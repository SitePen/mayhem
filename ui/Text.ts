/// <amd-dependency path="./renderer!Text" />

import View = require('./View');
import ui = require('./interfaces');
import util = require('../util');

var Renderer:any = require('./renderer!Text');

class TextView extends View implements ui.IText {
	constructor(kwArgs?:any) {
		util.deferMethods(this, [ 'setContent' ], '_render');
		super(kwArgs);
	}

	get:ui.ITextGet;
	set:ui.ITextSet;

	setContent(content:string):void {
		this._renderer.setContent(this, content);
	}
}

TextView.prototype._renderer = new Renderer();

export = TextView;
