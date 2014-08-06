/// <reference path="../../dijit" />

import BindDirection = require('../../binding/BindDirection');
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

	_isAttachedSetter(value:boolean):void {
		value && this._widget.startup();
		this._isAttached = value;
	}

	/**
	 * @protected
	 */
	_render():void {
		var self = this;

		var widget:_WidgetBase = new (<typeof DijitWidget> this.constructor).Ctor();

		var dijitName:string;
		var mayhemName:string;
		var setupMap:typeof DijitWidget.setupMap = (<typeof DijitWidget> this.constructor).setupMap;
		for (dijitName in setupMap.properties) {
			mayhemName = setupMap.properties[dijitName];
			// Binding must be from the Mayhem object to the widget in order to set the correct default values from
			// the Mayhem widget, not from the Dijit widget
			this._app.get('binder').bind({
				source: this,
				sourcePath: mayhemName,
				target: widget,
				targetPath: dijitName,
				direction: BindDirection.TWO_WAY
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
