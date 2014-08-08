/// <amd-dependency path="./dom/View" />

import has = require('../has');
import Widget = require('./Widget');

interface View extends Widget {
	get:View.Getters;
	on:View.Events;
	set:View.Setters;
}

module View {
	export interface Events extends Widget.Events {}

	export interface Getters extends Widget.Getters {
		(key:'model'):Object;
	}

	export interface Setters extends Widget.Setters {
		(key:'model', value:Object):void;
	}
}

/**
 * The View class is the base class for user interface components that contain content bindings to a data model.
 * TODO: This is probably wrong, and the term Widget needs to be removed and replaced with View. “Widget”s are views.
 * Everything inside Mayhem uses external data sources, or else doesn’t expose the data as a property.
 *
 * @constructor module:mayhem/View
 */
var View:{
	new (kwArgs:HashMap<any>):View;
	prototype:View;
};

/**
 * The data model used when binding to the view.
 *
 * @memberof module:mayhem/View#
 * @member model
 */

if (has('host-browser')) {
	View = <typeof View> require('./dom/View');
}

export = View;
