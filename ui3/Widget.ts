import ObservableEvented = require('../ObservableEvented');

var sid:string = String(new Date().getTime());
var uid:number = 0;

class Widget extends ObservableEvented {
	/**
	 * @protected
	 */
	_attached:boolean;

	/**
	 * @protected
	 */
	_classList:ClassList;

	/**
	 * @protected
	 */
	_id:string;

	constructor(kwArgs:HashMap<any>) {
		super(kwArgs);
		if (!this._id) {
			this._id = 'Widget' + sid + (++uid);
		}
	}

	suspend() {}

	destroy():void {

	}
}

module Widget {
	export interface Getters extends ObservableEvented.Getters {
		(key:'attached'):boolean;
		(key:'id'):string;
	}

	export interface Setters extends ObservableEvented.Setters {
		(key:'attached', value:boolean):void;
		(key:'id', value:string):void;
	}
}

export = Widget;

/**
 * so.
 * renderers.
 * let's see.
 *
 * how do we want to be able to use widgets?
 *
 * 1. mayhem/ui/form/Text -> platform-appropriate widget
 * 2. mayhem/ui/form/dom/Text -> specific platform widget
 *
 * key features:
 * * no loader plugin needed
 * * no duplication of APIs
 * * using specific platform widgets opens access to more platform-specific APIs?
 *
 * common (no rendering) + platform-specific (has rendering) = completed widget
 *
 * problem: two inheritance hierarchies need to be combined into one. platform-specifics will want to inherit from
 * other platform-specifics but also inherit from related common interfaces
 *
 * research: write the common interfaces, then figure out what “common” code actually exists, since it may be possible
 * to write the common interface and then have the platform-specific widgets call out to those methods
 */
