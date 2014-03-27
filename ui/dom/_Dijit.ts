/// <reference path="../../dojo" />
/// <reference path="../../dijit" />

import dom = require('./interfaces');
import DomElementRenderer = require('./_Element');
import lang = require('dojo/_base/lang');
import util = require('../../util');
import _WidgetBase = require('dijit/_WidgetBase');

class DijitRenderer extends DomElementRenderer {
	_ImplCtor:{ new (kwArgs?:any, node?:HTMLElement):_WidgetBase; };
	_implNameMap:{ [key:string]:string; };
	_implDefaults:{ [key:string]:any; };

	static implementation(properties:any):void {
		var proto:any = this.prototype;

		if (properties.nameMap) {
			var oldMap:any = proto._implNameMap;
			proto._implNameMap = oldMap ? lang.delegate(oldMap, properties.nameMap) : lang.mixin({}, properties.nameMap);
		}
		if (properties.defaults) {
			var oldDefaults:any = proto._implDefaults;
			proto._implDefaults = oldDefaults ? lang.delegate(oldDefaults, properties.defaults) : lang.mixin({}, properties.defaults);
		}
		if (properties.hasOwnProperty('constructor')) {
			proto._ImplCtor = properties.constructor;
		}
	}

	_getProperty(widget:dom.IDijitWidget, key:string):any {
		var value:any = widget.get(key);
		// TODO: if prop expects a function, pull from mediator and/or wrap
		// also: if prop.dijit, return dijit
		return value;
	}

	render(widget:dom.IDijitWidget):void {
		super.render(widget);
		
		var nameMap = this._implNameMap,
			inverseNameMap:{ [key:string]:string; } = {},
			key:string;

		// Invert property rename map
		for (key in nameMap) {
			inverseNameMap[nameMap[key]] = key;
		}

		// Walk widget values and get initial properties to pass to dijit constructor
		var args:any = lang.mixin({}, this._implDefaults);
		for (key in widget['_values']) {
			args[nameMap[key] || key] = this._getProperty(widget, key);
			// TODO: if prop expects a function, pull from mediator and/or wrap
		}

		var dijit = widget._impl = new this._ImplCtor(args);
		widget._firstNode = widget._lastNode = widget._outerFragment = dijit.domNode;
		widget.get('classList').set(dijit.domNode.className);

		// Sync widget with dijit
		var _notify:(value:any, oldValue:any, key:string) => void = widget['_notify'];
		widget['_notify'] = (value:any, oldValue:any, key:string):void => {
			_notify.apply(widget, arguments);
			if (util.isEqual(value, oldValue)) {
				return;
			}
			var dijitKey:string = nameMap[key] || key;
			if (!util.isEqual(value, dijit.get(dijitKey))) {
				dijit.set(dijitKey, value);
			}
		};
		dijit.watch((key:string, oldValue:any, value:any):void => {
			if (util.isEqual(value, oldValue)) {
				return;
			}
			var widgetKey:string = inverseNameMap[key] || key;
			if (!util.isEqual(value, widget.get(widgetKey))) {
				widget.set(widgetKey, value);
			}
		});

		// Startup when attached
		widget.observe('attached', (attached:boolean):void => {
			attached && dijit.startup();
		});
	}
}

DijitRenderer.implementation({
	nameMap: {
		tabindex: 'tabIndex'
	}
});

export = DijitRenderer;
