define([
	'dojo/_base/declare',
	'./Widget',
	'dojo/_base/lang',
	'dojo/dom-construct',
	'dojo/dom-class',
	'./dom-text'
], function (declare, Widget, lang, domConstruct, domClass, domText) {
	// summary:
	//		A widget for displaying model errors.

	return declare(Widget, {
		_create: function () {
			// Creating an ordered list because its semantically correct.
			this.domNode = domConstruct.create('ol');

			domClass.add(this.domNode, 'errorWidget');
			this.inherited(arguments);
		},

		postscript: function () {
			this.inherited(arguments);

			// Bind list to the model's errors array.
			var viewModel = this.viewModel,
				fieldName = this.fieldName;
			if (viewModel) {
				var errors = fieldName ? viewModel.getErrors(fieldName) : viewModel.getErrors();

				this._updateErrors(0, [], errors);
				errors.watchElements(lang.hitch(this, '_updateErrors'));
			}
		},

		_updateErrors: function (index, removals, adds) {
			var domNode = this.domNode,
				errorNodes = domNode.childNodes;

			// process removals
			var removalIndex = index + adds.length;
			for (var counter = 0; counter < removals.length; ++counter) {
				domNode.removeChild(errorNodes[removalIndex]);
			}

			// process additions
			for (var i = adds.length - 1; i >= 0; --i) {
				var errorNode = domConstruct.create('li', { 'class': 'error' });
				domText.set(errorNode, '' + adds[i]);

				if (domNode.childNodes.length > 0) {
					domNode.insertBefore(errorNode, errorNodes[index]);
				}
				else {
					domNode.appendChild(errorNode);
				}
			}

		}
	});
});
