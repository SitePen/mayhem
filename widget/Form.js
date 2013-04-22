define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'./Widget',
	'dojo/dom-construct',
	'dojo/on'
], function (declare, lang, Widget, domConstruct, on) {
	return declare(Widget, {

		_create: function () {
			this.domNode = domConstruct.create('form');
			this.inherited(arguments);
		},

		submit: function () {
			// TODO: This probably needs to be cancelable.
			this.emit('submit');
		},

		_submitInitListener: function () {
			var handle = on(this.domNode, 'submit', lang.hitch(this, function (event) {
				this.submit();

				// These is an app framework form. Always prevent default HTML form submission.
				event.preventDefault();
				return false;
			}));
			this.own(handle);
			return handle;
		}

		// onSubmit:
		//		When the form is submitted.
	});
});