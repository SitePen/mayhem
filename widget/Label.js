define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'./Widget',
	'dojo/dom-construct',
	'dojo/dom-class',
	'./dom-text',
	'dojo/domReady!'
], function (declare, lang, Widget, domConstruct, domClass, domText) {
	// summary:
	//		A label widget that reflects whether the associated field is required.

	// TODO: Define a way for a label to be associated with an input widget. Probably a job for the template parser.
	return declare(Widget, {
		_create: function () {
			this.domNode = domConstruct.create('label');
			domClass.add(this.domNode, 'labelWidget');
			this.inherited(arguments);
		},

		postscript: function () {
			this.inherited(arguments);

			if (this.viewModel && this.fieldName) {
				this._refreshFromModel();
				this.own(
					this.viewModel.watch(lang.hitch(this, '_refreshFromModel'))
				);
			}
		},

		_textContentGetter: function () {
			return domText.get(this.domNode);
		},

		_textContentSetter: function (value) {
			domText.set(this.domNode, value);
		},

		_refreshFromModel: function () {
			var method = this.viewModel.isFieldRequired(this.fieldName) ? 'add' : 'remove';
			domClass[method](this.domNode, 'requiredField');
		}
	});
});