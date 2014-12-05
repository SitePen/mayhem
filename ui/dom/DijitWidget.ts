/// <reference path="../../dijit" />

import BindDirection = require('../../binding/BindDirection');
import SingleNodeWidget = require('./SingleNodeWidget');
import _WidgetBase = require('dijit/_WidgetBase');

class DijitWidget extends SingleNodeWidget {
	static Ctor:typeof _WidgetBase;
	static setupMap:{
		events?:HashMap<(event?:Event) => void>;
		properties?:HashMap<string>;
	} = {
		properties: {
			disabled: 'disabled',
			id: 'id'
		},
		events: {
			blur: function ():void {
				this.set('focused', false);
			},
			focus: function ():void {
				this.set('focused', true);
			}
		}
	};

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_disabled:boolean;

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
		var widget:_WidgetBase = new (<typeof DijitWidget> this.constructor).Ctor();

		var dijitName:string;
		var mayhemName:string;
		var setupMap:typeof DijitWidget.setupMap = (<typeof DijitWidget> this.constructor).setupMap;
		for (mayhemName in setupMap.properties) {
			dijitName = setupMap.properties[mayhemName];
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

		var widget:{ _setStateClass?:Function; destroyRecursive:() => void; } = this._widget;

		// The `focused` property of a widget will be changed by `dijit/focus` after it is destroyed if it was focused
		// at the time of its destruction. This will cause `_CssStateMixin` to crash later on, because it fails to check
		// whether or not the widget has been destroyed before trying to access the `className` property of the DOM node
		if (widget._setStateClass) {
			widget._setStateClass = function ():void {};
		}
		widget.destroyRecursive();

		this._widget = this._node = null;
	}
}

DijitWidget.prototype._disabled = false;

module DijitWidget {
	export interface Events extends SingleNodeWidget.Events {}
	export interface Getters extends SingleNodeWidget.Getters {
		(key:'disabled'):boolean;
	}
	export interface Setters extends SingleNodeWidget.Setters {
		(key:'disabled', value:boolean):void;
	}
}

export = DijitWidget;
