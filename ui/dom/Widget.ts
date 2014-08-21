import actions = require('./actions');
import CommonWidget = require('../common/Widget');
import Container = require('./Container');
import core = require('../../interfaces');

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

Widget.prototype.on = function (type:any, listener:core.IEventListener<core.IEvent>):IHandle {
	// TODO: Can we do this better?
	if (typeof type === 'string' && actions[type]) {
		return actions[type](this, listener);
	}

	return CommonWidget.prototype.on.apply(this, arguments);
};

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
