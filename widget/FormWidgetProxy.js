define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/aspect',
	'./FormWidget'
], function (declare, lang, aspect, FormWidget) {

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

		_create: function (propertiesToMixIn, srcNodeRef) {
			var dijitPropertiesToMixIn = lang.mixin({}, propertiesToMixIn, {
				intermediateChanges: true,
				onChange: lang.hitch(this, '_applyChangeFromUser')
			});

			this._proxiedWidget = new this.WidgetToProxy(dijitPropertiesToMixIn, srcNodeRef);
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

		focus: function () {
			this._proxiedWidget.focus();
		}
	});
});