import IView = require('../View');
import MultiNodeWidget = require('./MultiNodeWidget');

class View extends MultiNodeWidget implements IView {
	/**
	 * @protected
	 */
	_model:Object;

	get:View.Getters;
	on:View.Events;
	set:View.Setters;
}

module View {
	export interface Events extends MultiNodeWidget.Events, IView.Events {}
	export interface Getters extends MultiNodeWidget.Getters, IView.Getters {}
	export interface Setters extends MultiNodeWidget.Setters, IView.Setters {}
}

export = View;
