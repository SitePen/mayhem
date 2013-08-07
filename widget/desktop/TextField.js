define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'../FormWidgetProxy',
	'dijit/form/TextBox',
	'dojo/dom-class'
], function (declare, lang, FormWidgetProxy, DijitTextBox, domClass) {
	return declare(FormWidgetProxy, {
		WidgetToProxy: DijitTextBox,

		// type: [readonly] String
		//		The type of textbox (e.g., text, password, email, etc)
		type: 'text',

		_create: function () {
			this.inherited(arguments);
			domClass.add(this.domNode, 'textFieldWidget');
		},

		_createProxiedWidget: function (propertiesToMixIn, srcNodeRef) {
			// Provide default type
			propertiesToMixIn = lang.mixin({ type: this.type }, propertiesToMixIn);
			this.inherited(arguments, [ propertiesToMixIn, srcNodeRef ]);
		}
	});
});
