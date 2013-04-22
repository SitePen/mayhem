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

		// _valueOnFocus:
		//		The value of the control when it was focused. Considered when deciding whether to emit a change event on blur. 
		_valueOnFocus: null,

		// _appliedUserChange: Boolean
		//		Whether or not the user made a change while this control was focused.
		_appliedUserChange: false,

		_create: function () {
			this.inherited(arguments);
			domClass.add(this.domNode, 'formWidget');

			this.own(
				this.on('focus', lang.hitch(this, '_rememberValueOnFocus')),
				this.on('blur', lang.hitch(this, '_reportChangeFromUserOnBlur'))
			);
		},

		postscript: function (propertiesToMixIn, srcNodeRef) {
			// Apply default tabIndex if none is specified.
			propertiesToMixIn = propertiesToMixIn || {};
			if (!('tabIndex' in propertiesToMixIn)) {
				propertiesToMixIn.tabIndex = this.tabIndex;
			}

			this.inherited(arguments, [ propertiesToMixIn, srcNodeRef ]);
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

		_tabIndexSetter: function (value) {
			this.tabIndex = value;
			this.domNode.tabIndex = value;
		},

		_disabledSetter: function (value) {
			this.disabled = true;

			var methodName = value ? 'add' : 'remove';
			domClass[methodName](this.domNode, 'widgetDisabled');

			if (this._controlNode !== null) {
				this._controlNode.disabled = value;
			}
		},

		// TODO: Pick a better name.
		_applyChangeFromUser: function (newValue) {
			if (this.value !== newValue) {
				this.set('value', newValue);
				this.emit('input', { bubbles: true });
				this._appliedUserChange = true;
			}
		},

		_rememberValueOnFocus: function () {
			this._valueAtFocus = this.get('value');
		},

		_reportChangeFromUserOnBlur: function () {
			if (this._appliedUserChange && this.get('value') !== this._valueAtFocus) {
				this._appliedUserChange = false;
				this.emit('change');
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

		focus: function () {
			// summary:
			//		Set focus on this widget
			this.domNode.focus();
		},

		_focusInitListener: function () {
			return this._initDomListenerProxy('focusin', 'focus');
		},

		_blurInitListener: function () {
			return this._initDomListenerProxy('focusout', 'blur');
		},

		_inputInitListener: function () {
			return this._initDomListenerProxy(inputExtensionEvent, 'input');
		},

		_changeInitListener: function () {
			return this._initDomListenerProxy('change');
		}
	});
});