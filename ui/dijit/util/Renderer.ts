import dijit = require('../interfaces');
import domUtil = require('../../../ui/dom/util');
import PlacePosition = require('../../../ui/PlacePosition');
import StyledRenderer = require('../../dom/StyledComponent');
import util = require('../../../util');
import _WidgetBase = require('../_WidgetBase');

class DijitRenderer extends StyledRenderer {
	add(widget:dijit.IWidgetBase, item:dijit.IWidgetBase, referenceItem:dijit.IWidgetBase, position:any):void {
		var _dijit = <dijit._WidgetContainer> widget._dijit;
		if (_dijit.addChild) {
			if (position in PlacePosition) {
				position = domUtil.PLACE_POSITION_KEYS[position];
			}
			_dijit.addChild(item._dijit, position);
		}
	}

	private _bindDijitProperty(widget:dijit.IWidgetBase, _dijit:dijit._WidgetBase, widgetKey:string, dijitKey:string, property:any):void {
		// TODO: use widget._bind (requires monkeypatching dijit/_WidgetBase to implement IObservable)
		// In the meantime, find a clean way to keep our handles for teardown
		widget.observe(widgetKey, (value:any):void => {
			_dijit.set(dijitKey, this._getPropertyValue(widget, widgetKey, property, value));
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
		var _dijit = widget._dijit;
		if (_dijit) {
			_dijit.destroyRecursive();
			_dijit = null;
		}
		super.destroy(widget);
	}

	private _getBodyNode(widget:dijit.IWidgetBase):HTMLElement {
		var _dijit = widget._dijit;
		return _dijit.containerNode || _dijit.domNode;
	}

	private _getPropertyValue(widget:dijit.IWidgetBase, widgetKey:string, property:any, value:any):any {
		if (value === undefined) {
			value = property.value;
		}
		// If property is a child dijit return _dijit
		// TODO: fix circular dep issues so we can use `property.type === _WidgetBase`
		if (property.type.name === '_WidgetBase') {
			return value._dijit;
		}
		// If property is an action return wrapped mediator method
		if (property.type === Function && value) {
			return (e:Event):boolean => {
				var mediator = widget.get('mediator');
				console.log('action called:', widgetKey, '-- mediator method:', value);
				if (typeof value === 'function') {
					return value.apply(mediator, arguments);
				}
				value = widget.get(widgetKey);
				return (mediator && mediator[value]) ? mediator[value](e) : true;
			};
		}
		return value;
	}

	render(widget:dijit.IWidgetBase, options?:any):void {
		super.render(widget, options);

		// Walk dijit schema and get initial properties to pass to constructor
		var config:any = widget._dijitConfig,
			schema:any = config.schema,
			renameMap:any = config.rename,
			dijitArgs:any = {},
			property:any,
			widgetKey:string;
		for (var dijitKey in schema) {
			property = schema[dijitKey];
			widgetKey = renameMap[dijitKey] || dijitKey;
			var initialValue:any = this._getPropertyValue(widget, widgetKey, property, widget.get(widgetKey));
			if (initialValue !== undefined) {
				dijitArgs[dijitKey] = initialValue;
			}
		}

		// Build dijit
		//dijitArgs.id = widget.get('id');
		var Dijit = widget._dijitConfig.Dijit,
			_dijit:dijit._WidgetBase = new Dijit(dijitArgs);
		widget._dijit = _dijit;
		widget.set({
			// TODO: Component-based renderers should only require setting one of these
			firstNode: _dijit.domNode,
			fragment: _dijit.domNode,
			lastNode: _dijit.domNode
		});
		widget.classList.set(_dijit.domNode.className);

		// Walk dijit schema again to set up bindings
		for (var dijitKey in schema) {
			property = schema[dijitKey];
			widgetKey = renameMap[dijitKey] || dijitKey;
			this._bindDijitProperty(widget, _dijit, widgetKey, dijitKey, property);
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
		var config:any = widget._dijitConfig,
			requiredFields:string[] = config.getRequiredFields(),
			field:string;
		for (var i = 0; (field = requiredFields[i]); ++i) {
			// TODO: widget.has(field)
			if (widget.get(field) == null) {
				throw new Error('Dijit widget requires `' + field + '` property');
			}
		}
		widget._dijit.startup();
	}
}

export = DijitRenderer;
