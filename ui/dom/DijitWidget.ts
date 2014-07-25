/// <reference path="../../dijit" />

import SingleNodeWidget = require('./SingleNodeWidget');
import _WidgetBase = require('dijit/_WidgetBase');

class DijitWidget extends SingleNodeWidget {
	static Ctor:typeof _WidgetBase;
	static setupMap:{
		events?:HashMap<(event?:Event) => void>;
		properties?:HashMap<string>;
	};

	/**
	 * @protected
	 */
	_widget:_WidgetBase;

	/**
	 * @protected
	 */
	_render():void {
		var self = this;
		var widget:_WidgetBase = new (<typeof DijitWidget> this.constructor).Ctor();
		var setupMap:typeof DijitWidget.setupMap = (<typeof DijitWidget> this.constructor).setupMap;

		var dijitName:string;
		var mayhemName:string;
		for (dijitName in setupMap.properties) {
			mayhemName = setupMap.properties[dijitName];
			this._app.get('binder').bind({
				source: widget,
				sourceBinding: dijitName,
				target: this,
				targetBinding: mayhemName
			});
		}

		var event:string;
		for (event in setupMap.events) {
			widget.on(event, setupMap.events[event]);
		}

		this._widget = widget;
		this._node = widget.domNode;
	}

	destroy():void {
		super.destroy();
		this._widget.destroyRecursive();
		this._widget = this._node = null;
	}
}

module DijitWidget {
	export interface Events extends SingleNodeWidget.Events {}
	export interface Getters extends SingleNodeWidget.Getters {}
	export interface Setters extends SingleNodeWidget.Setters {}
}

export = DijitWidget;
