import actions = require('./actions');
import CommonWidget = require('../common/Widget');
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
	// TS7017
	// TODO: Should be HashMap of Mayhem extension events
	var _actions:HashMap<Function> = <any> actions;
	if (typeof type === 'string' && _actions[type]) {
		var handle = _actions[type](this, listener);
		this._eventListeners.push(handle);
		return handle;
	}

	return CommonWidget.prototype.on.apply(this, arguments);
};

module Widget {
	export interface Events extends CommonWidget.Events {}
	export interface Getters extends CommonWidget.Getters {
		(key:'firstNode'):Node;
		(key:'lastNode'):Node;
		(key:'parent'):Widget;
	}
	export interface Setters extends CommonWidget.Setters {}
}

export = Widget;
