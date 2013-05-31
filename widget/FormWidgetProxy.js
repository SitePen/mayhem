define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/aspect',
	'./FormWidget'
], function (declare, lang, aspect, FormWidget) {

	function createProxiedGetter(propertyName) {
		return function () {
			return this._proxiedWidget.get(propertyName);
		};
	}

	function createProxiedSetter(propertyName) {
		return function (value) {
			this._proxiedWidget.set(propertyName, value);
			this.inherited(arguments);
		};
	}

	var FormWidgetProxy = declare(FormWidget, {

		// WidgetToProxy:
		//		The constructor of the widget to be proxied.
		WidgetToProxy: null,

		// _proxiedWidget: Object
		//		The proxied widget.
		_proxiedWidget: null,

		_create: function (propertiesToMixIn, srcNodeRef) {
			this._createProxiedWidget(propertiesToMixIn, srcNodeRef);
			this.domNode = this._proxiedWidget.domNode;
			this.inherited(arguments);
		},

		_createProxiedWidget: function (/*Object?*/propertiesToMixIn, /*DomNode|String?*/ srcNodeRef) {
			// summary:
			//		Creates the proxied widget.
			// propertiesToMixIn:
			//		The properties to mix into the proxied widget.
			// srcNodeRef:
			//		A reference point for creating the proxied widget.
			// returns:
			//		Returns the newly created widget to proxy
			this._proxiedWidget = new this.WidgetToProxy(propertiesToMixIn, srcNodeRef);
		},

		startup: function () {
			this._proxiedWidget.startup();
			this.inherited(arguments);
		},

		_nameGetter: createProxiedGetter('name'),
		_nameSetter: createProxiedSetter('name'),
		_valueGetter: createProxiedGetter('value'),
		_valueSetter: createProxiedSetter('value'),
		_disabledGetter: createProxiedGetter('disabled'),
		_disabledSetter: createProxiedSetter('disabled'),
		_tabIndexGetter: createProxiedGetter('tabIndex'),
		_tabIndexSetter: createProxiedSetter('tabIndex'),

		focus: function () {
			this._proxiedWidget.focus();
		}
	});
	FormWidgetProxy.createProxiedGetter = createProxiedGetter;
	FormWidgetProxy.createProxiedSetter = createProxiedSetter;
	return FormWidgetProxy;
});