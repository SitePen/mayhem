define([
	'dojo/_base/declare',
	'./FormWidget'
], function (declare, FormWidget) {

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
		},

		startup: function () {
			this._proxiedWidget.startup();
			this.inherited(arguments);
		},

		_nameSetter: createProxiedSetter('name'),
		_valueSetter: createProxiedSetter('value'),
		_disabledSetter: createProxiedSetter('disabled')
	});
});