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
				// TODO: Determine whether this is the right or complete set of events to use for simulating the input event.
				eventNames = [
					'cut',
					'paste',
					'keydown',
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

	// TODO: FormWidgets should listen for errors on the field they're bound to and apply an aria-invalid state.
	// http://www.w3.org/TR/2010/WD-wai-aria-20100916/states_and_properties#aria-invalid
	return declare(Widget, {
		// summary:
		//		The base class for all form widgets.

		// name: String
		// 		The name of the form widget
		name: null,

		// value:
		//		The value of the form widget

		// disabled: Boolean
		//		Whether or not the form widget is disabled

		_create: function () {
			this.inherited(arguments);
			domClass.add(this.domNode, 'formWidget');

			// Default tab order.
			this.set('tabIndex', 0);
		},

		_disabledGetter: function () {
			return domClass.contains(this.domNode, 'widgetDisabled');
		},

		_disabledSetter: function (value) {
			var methodName = value ? 'add' : 'remove';
			domClass[methodName](this.domNode, 'widgetDisabled');
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
