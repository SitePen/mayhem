define([
	'dojo/_base/declare',
	'../FormWidgetProxy',
	'dijit/form/RadioButton',
	'dojo/dom-class'
], function (declare, FormWidgetProxy, RadioButton, domClass) {
	return declare(FormWidgetProxy, {
		WidgetToProxy: RadioButton,

		_create: function () {
			this.inherited(arguments);
			domClass.add(this.domNode, 'radioButtonWidget');

			// We must always be registered for these events because they bubble
			// and are based on Dijit behavior so a handler registered
			// on an ancestor will not receive them through DOM bubbling.
			var self = this,
				bubblingEvent = { bubbles: true };
			this.own(
				this._proxiedWidget.on('change', function () { self.emit('input', bubblingEvent); }),
				this._proxiedWidget.on('change', function () { self.emit('change', bubblingEvent); })
			);
		},

		_checkedGetter: function () {
			this._proxiedWidget.get('checked');
		},
		_checkedSetter: function (checked) {
			this._proxiedWidget.set('checked', checked);
		}
	});
});
