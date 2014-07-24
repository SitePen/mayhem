import CommonWidget = require('../common/Widget');

/**
 * @abstract
 */
class Widget extends CommonWidget {
	constructor(kwArgs?:HashMap<any>) {
		super(kwArgs);
		this._render();
	}

	detach():Node {
		return null;
	}

	_render():void {}
}

module Widget {
	export interface Events extends CommonWidget.Events {}
	export interface Getters extends CommonWidget.Getters {
		(key:'firstNode'):Node;
		(key:'lastNode'):Node;
	}
	export interface Setters extends CommonWidget.Setters {}
}

export = Widget;
