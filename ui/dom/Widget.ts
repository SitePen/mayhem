import CommonWidget = require('../common/Widget');
import Container = require('./Container');
import core = require('../../interfaces');
import Master = require('./Master');

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
		return <any> super.detach();
	}
}

module Widget {
	export interface Events extends CommonWidget.Events {}
	export interface Getters extends CommonWidget.Getters {
		(key:'firstNode'):Node;
		(key:'lastNode'):Node;
		(key:'parent'):Container;
	}
	export interface Setters extends CommonWidget.Setters {}
}

export = Widget;
