import dijit = require('./interfaces');
import StyledRenderer = require('../dom/StyledComponent');
import util = require('../../util');

class DijitRenderer extends StyledRenderer {
	private _bindDijitProperty(widget:dijit.IWidgetBase, widgetKey:string, dijitKey:string, initialValue:any):void {
		var _dijit = widget.get('_dijit');
		// Get initial value (defaulting to a value specified by dijit schema)
		initialValue = widget.get(widgetKey) || initialValue;
		initialValue !== undefined && _dijit.set(dijitKey, initialValue);

		// TODO: use widget._bind (requires monkeypatching dijit/_WidgetBase to implement IObservable)
		// In the meantime, find a clean way to keep our handles for teardown
		widget.observe(widgetKey, (value:any):void => {
			_dijit.set(dijitKey, value);
		});

		// TODO: allow a debounce rate to be specified per field?
		_dijit.watch(dijitKey, (key:string, oldValue:any, value:any):void => {
			widget.set(widgetKey, value);
		});
	}

	clear(widget:dijit.IWidgetBase):void {
		this._getBodyNode(widget).innerHTML = '';
	}

	destroy(widget:dijit.IWidgetBase):void {
		var _dijit = widget.get('_dijit');
		if (_dijit) {
			_dijit.destroyRecursive();
			_dijit = null;
		}
		super.destroy(widget);
	}

	_getBodyNode(widget:dijit.IWidgetBase):HTMLElement {
		var _dijit = widget.get('_dijit');
		return _dijit.containerNode || _dijit.domNode;
	}

	render(widget:dijit.IWidgetBase, options?:any):void {
		super.render(widget, options);
		var Dijit = widget.get('_dijitConfig').Dijit,
			_dijit:dijit._IWidgetBase = new Dijit({ id: widget.get('id') });
		// var _DijitCtor = widget.get('_DijitCtor'),
		// 	_dijit:dijit._IWidgetBase = new _DijitCtor({ id: widget.get('id') });
		widget.set({
			_dijit: _dijit,
			// TODO: Component-based renderers should only require setting one of these
			firstNode: _dijit.domNode,
			fragment: _dijit.domNode,
			lastNode: _dijit.domNode
		});
		widget.get('classList').set(_dijit.domNode.className);

		var config:any = widget.get('_dijitConfig'),
			schema:any = config.schema,
			renameMap:any = config.rename,
			property:any,
			widgetKey:string;
		for (var dijitKey in schema) {
			property = schema[dijitKey];
			widgetKey = renameMap[dijitKey] || dijitKey;
			this._bindDijitProperty(widget, widgetKey, dijitKey, property.value);
		}

		// Observe attached property to know when to call _startup
		// TODO: keep handle for teardown
		widget.observe('attached', (attached:boolean) => {
			if (attached) {
				this._startup(widget);
			}
		});
	}

	setBody(widget:dijit.IWidgetBase, body?:any /* string | Node */):void {
		var bodyNode = this._getBodyNode(widget);
		if (typeof body === 'string') {
			bodyNode.innerHTML = body;
		}
		else {
			this.clear(widget);
			body && bodyNode.appendChild(body);
		}
		
	}

	private _startup(widget:dijit.IWidgetBase):void {
		// Verify required fields before starting up
		// TODO: dijitConfig.getRequiredFields()
		var config:any = widget.get('_dijitConfig'),
			schema:any = config.schema,
			property:any;
		for (var dijitKey in schema) {
			property = schema[dijitKey];
			if (property.required && !widget.get(dijitKey)) {
				throw new Error('Dijit widget requires `' + dijitKey + '` property');
			}
		}
		widget.get('_dijit').startup();
	}
}

export = DijitRenderer;
