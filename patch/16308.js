define([ "dijit/_WidgetsInTemplateMixin" ], function (_WidgetsInTemplateMixin) {
	var oldStartup = _WidgetsInTemplateMixin.prototype.startup;
	_WidgetsInTemplateMixin.extend({
		startup: function () {
			//	summary:
			//		Prevents memory leaks from widgets inside a templated widget being destroyed.

			oldStartup.apply(this, arguments);
			this._startupWidgets = null;
		}
	});
});