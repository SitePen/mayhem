define([
	'dojo/_base/declare',
	'./Widget',
	'dojo/dom-class'
], function (declare, Widget, domClass) {
	return declare(Widget, {
		// summary:
		//		The base class for all form widgets.

		// name: String
		// 		The name of the form widget
		name: null,

		// value:
		//		The value of the form widget
		value: null,

		// disabled: Boolean
		//		Whether or not the form widget is disabled
		disabled: false,

		// controlNode: DomNode
		//		The underlying form control's DOM node.
		//		Optional but should normally be defined for widgets wrapping a single form control.
		// tags:
		//		protected
		_controlNode: null,

		// _valueAtStartup:
		//		The value of the control at startup, used as as the initial widget value on reset.
		// tags:
		//		private
		_valueAtStartup: null,

		_nameSetter: function (value) {
			this.name = value;
			if (this._controlNode !== null) {
				this._controlNode.name = value;
			}
		},

		_disabledSetter: function (value) {
			this.disabled = true;

			var methodName = value ? 'add' : 'remove';
			domClass[methodName](this.domNode, 'mayhemWidgetDisabled');

			if (this._controlNode !== null) {
				this._controlNode.disabled = value;
			}
		},

		startup: function () {
			this.inherited(arguments);
			this._valueAtStartup = this.get('value');
		},

		reset: function () {
			// summary:
			//		Reset the widget to its value at startup.
			this.set('value', this._valueAtStartup);
		}
	});
});