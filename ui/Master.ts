/// <amd-dependency path="./dom/Master" />

import core = require('../interfaces');
import has = require('../has');
import ObservableEvented = require('../ObservableEvented');
import View = require('./View');

interface Master extends ObservableEvented, core.IApplicationComponent {
	get:Master.Getters;
	on:Master.Events;
	set:Master.Setters;
}

module Master {
	export interface Events extends ObservableEvented.Events {}

	export interface Getters extends ObservableEvented.Getters {
		(key:'app'):core.IApplication;
		(key:'view'):View;
	}

	export interface Setters extends ObservableEvented.Setters {
		(key:'app', value:core.IApplication):void;
		(key:'view', value:View):void;
	}
}

/**
 * Master is the root {@link TODO application component} class for creating a user interface. It is responsible for
 * attaching a root Mayhem {@link module:mayhem/ui/View View} to the underlying platform’s window system and manages
 * any top-level interactions between the platform and the Mayhem view system.
 *
 * @constructor module:mayhem/ui/Master
 */
var Master:{
	new (kwArgs:HashMap<any>):Master;
	prototype:Master;
};

/**
 * The root view of the user interface. This view will receive the {@link module:mayhem/Application} object as its
 * view model.
 *
 * @memberof module:mayhem/ui/Master#
 * @member view
 */

if (has('host-browser')) {
	Master = <typeof Master> require('./dom/Master');
}

export = Master;
