import ContentWidget = require('../ContentWidget');
import form = require('./interfaces');

class Control extends ContentWidget implements form.IControl {
	_disabled:boolean;
	_name:string;
	_tabIndex:number;

	constructor(kwArgs:any = {}) {
		this.initialize(kwArgs);
		super(kwArgs);
	}

	initialize(kwArgs:any):void {}
}

export = Control;
