define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'./Widget',
	'dojo/on',
	'dojo/dom-class',
	'dojo/has',
	'dojo/dom-construct'
], function (declare, lang, Widget, on, domClass, has, domConstruct) {

	has.add('dom-input-event', function () {
		var inputElement = domConstruct.create('input'),
			supportsInputEvent = 'oninput' in inputElement;
		domConstruct.destroy(inputElement);
		return supportsInputEvent;
	});

	// TODO: Test this on browsers that don't support the input event.
	function inputExtensionEvent(targetNode, listener) {
		if (has('dom-input-event')) {
			return on(targetNode, 'input', listener);
		}
		else {
			var handles = [],
				aggregateHandle = {
					remove: function () {
						while (handles.length > 0) { handles.pop.remove(); }
					}
				},
				eventNames = [
					'cut',
					'paste',
					'keypress',
					'drop'
				];

			try {
				for (var i = 0; i < eventNames.length; i++) {
					handles.push(on(targetNode, eventNames[i], listener));
				}
				return aggregateHandle;
			} catch (e) {
				aggregateHandle.remove();
				throw e;
			}
		}
	}

	return declare(Widget, {
		// summary:
		//		The base class for all form widgets.

		// name: String
		// 		The name of the form widget
		name: null,

		// value:
		//		The value of the form widget
		value: null,

		// tabIndex: Number
		//		The widget's place in the tab order
		tabIndex: 0,

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

		_create: function () {
			this.inherited(arguments);
			domClass.add(this.domNode, 'formWidget');

			// Default tab order.
			this.set('tabIndex', 0);
		},

		_nameSetter: function (value) {
			this.name = value;
			if (this._controlNode !== null) {
				this._controlNode.name = value;
			}
		},

		_valueSetter: function (value) {
			this.value = value;
		},

		_disabledSetter: function (value) {
			this.disabled = true;

			var methodName = value ? 'add' : 'remove';
			domClass[methodName](this.domNode, 'widgetDisabled');

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
		},

		_inputInitListener: function () {
			return this._initDomListenerProxy(inputExtensionEvent, 'input');
		},

		_changeInitListener: function () {
			return this._initDomListenerProxy('change');
		}

		// onInput:
		// 		When the user changes the value of a widget while it has focus.

		// onChange:
		//		When the widget loses focus and the user has changed the value.
	});
});