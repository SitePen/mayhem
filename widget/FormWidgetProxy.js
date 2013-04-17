define([
	'dojo/_base/declare',
	'dojo/aspect',
	'./FormWidget'
], function (declare, aspect, FormWidget) {

	function createProxiedSetter(propertyName) {
		return function (value) {
			this._proxiedWidget.set(propertyName, value);
			this.inherited(arguments);
		};
	}

	return declare(FormWidget, {

		// WidgetToProxy:
		//		The constructor of the widget to be proxied.
		WidgetToProxy: null,

		// _proxiedWidget: Object
		//		The proxied widget.
		_proxiedWidget: null,

		_create: function (propertiesToMixIn) {
			this._proxiedWidget = new this.WidgetToProxy(propertiesToMixIn);
			this.domNode = this._proxiedWidget.domNode;
			this.inherited(arguments);
		},

		startup: function () {
			this._proxiedWidget.startup();
			this.inherited(arguments);
		},

		_nameSetter: createProxiedSetter('name'),
		_valueSetter: createProxiedSetter('value'),
		_disabledSetter: createProxiedSetter('disabled'),
		_tabIndexSetter: createProxiedSetter('tabIndex'),

		on: function (type, listener) {
			// NOTE: This breaks expectations of the overall widget API.
			// Whether an event type bubbles should be constant over the widget library,
			// not dependent on whether the widget uses a Dijit under the covers.
			var dijitOnMap = this._proxiedWidget.constructor._onMap;
			if (typeof type === 'string' && dijitOnMap[type]) {
				// There is a Dijit method for this event type. Defer event handling to this Dijit in this case.
				var aspectHandle = aspect.after(dijitOnMap, type, function (event) {
					listener.call(this, event);
				});
				this.own(aspectHandle);
				return aspectHandle;
			} else {
				return this.inherited(arguments);
			}
		},

		focus: function () {
			this._proxiedWidget.focus();
		}
	});
});