/// <reference path="../../dijit" />

import BindDirection = require('../../binding/BindDirection');
import lang = require('dojo/_base/lang');
import SingleNodeWidget = require('./SingleNodeWidget');
import _WidgetBase = require('dijit/_WidgetBase');

class DijitWidget extends SingleNodeWidget {
	static Ctor:typeof _WidgetBase;
	static setupMap:{
		events?:HashMap<(event?:Event) => void>;
		properties?:HashMap<string>;
	} = {
		properties: {
			isDisabled: 'disabled'
		},
		events: {
			blur: function ():void {
				this.set('isFocused', false);
			},
			focus: function ():void {
				this.set('isFocused', true);
			}
		}
	};

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_isDisabled:boolean;

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_isFocused:boolean;

	/**
	 * @protected
	 */
	_widget:_WidgetBase;

	_isAttachedGetter():boolean {
		return this._isAttached;
	}
	_isAttachedSetter(value:boolean):void {
		value && this._widget.startup();
		this._isAttached = value;
	}

	_isFocusedGetter():boolean {
		return this._isFocused;
	}
	_isFocusedSetter(value:boolean):void {
		value && this._widget.domNode.focus();
		this._isFocused = value;
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

		var eventName:string;
		for (eventName in setupMap.events) {
			widget.on(eventName, lang.hitch(this, function (eventName:string, ...args:any[]):void {
				setupMap.events[eventName].apply(this, args);
			}, eventName));
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

DijitWidget.prototype._isDisabled = false;

module DijitWidget {
	export interface Events extends SingleNodeWidget.Events {}
	export interface Getters extends SingleNodeWidget.Getters {
		(key:'isDisabled'):boolean;
		(key:'isFocused'):boolean;
	}
	export interface Setters extends SingleNodeWidget.Setters {
		(key:'isDisabled', value:boolean):void;
		(key:'isFocused', value:boolean):void;
	}
}

export = DijitWidget;
