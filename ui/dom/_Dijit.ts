import dom = require('./interfaces');
import _ElementRenderer = require('./_Element');
import lang = require('dojo/_base/lang');
import ui = require('../interfaces');
import _WidgetBase = require('dijit/_WidgetBase');

class DijitRenderer extends _ElementRenderer {
	DijitCtor:typeof _WidgetBase;
	_dijitArgs:any;
	_dijitRename:any;

	static delegate(Base:typeof DijitRenderer, key:string, initialValues:any):void {
		this['prototype'][key] = lang.delegate(Base['prototype'][key], initialValues);
	}

	_getProperty(widget:dom.IDijitWidget, key:string):any {
		var value:any = widget.get(key);
		// TODO: if prop expects a function, pull from mediator and/or wrap
		// also: if prop.dijit, return dijit
		return value;
	}

	render(widget:dom.IDijitWidget):void {
		super.render(widget);
		
		var dijitRename:any = this._dijitRename,
			inverseRename:any = {},
			key:string;
		// Invert property rename map
		for (key in dijitRename) {
			inverseRename[dijitRename[key]] = key;
		}

		// Walk widget values and get initial properties to pass to dijit constructor
		var dijitArgs:any = lang.mixin({}, this._dijitArgs);
		for (key in widget._values) {
			dijitArgs[dijitRename[key] || key] = this._getProperty(widget, key);
			// TODO: if prop expects a function, pull from mediator and/or wrap
		}

		var dijit:_WidgetBase = widget._impl = new this.DijitCtor(dijitArgs);
		widget._firstNode = widget._lastNode = widget._fragment = dijit.domNode;
		widget.get('classList').set(dijit.domNode.className);

		// Sync widget with dijit
		var _notify:(value:any, oldValue:any, key:string) => void = widget['_notify'];
		widget['_notify'] = (value:any, oldValue:any, key:string):void => {
			_notify.apply(widget, arguments);
			if (value === oldValue) {
				return;
			}
			var dijitKey:string = dijitRename[key] || key;
			if (value !== dijit.get(dijitKey)) {
				dijit.set(dijitKey, value);
			}
		};
		dijit.watch((key:string, oldValue:any, value:any):void => {
			if (value === oldValue) {
				return;
			}
			var widgetKey:string = inverseRename[key] || key;
			if (value !== widget.get(widgetKey)) {
				widget.set(widgetKey, value);
			}
		});

		// Startup when attached
		widget.observe('attached', (attached:boolean):void => {
			attached && dijit.startup();
		});
	}
}

export = DijitRenderer;
