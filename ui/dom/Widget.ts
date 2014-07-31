import CommonWidget = require('../common/Widget');

/**
 * @abstract
 */
class Widget extends CommonWidget {
	get:Widget.Getters;
	on:Widget.Events;
	set:Widget.Setters;

	/**
	 * @abstract
	 */
	detach():Node {
		super.detach();
		return null;
	}
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
