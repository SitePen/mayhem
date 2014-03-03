import ContentWidget = require('../ContentWidget');

/* abstract */ class Control extends ContentWidget {
	_disabled:boolean;
	_tabIndex:number;

	constructor(kwArgs:any = {}) {
		this.initialize(kwArgs);
		super(kwArgs);
	}

	initialize(kwArgs:any):void {}
}

export = Control;
