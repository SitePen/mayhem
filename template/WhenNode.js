define([
	'dojo/_base/lang',
	'dojo/_base/declare',
	'./BoundNode'
], function (lang, declare, BoundNode) {
	return declare(BoundNode, {
		// summary:
		//		Template node that displays content relative to a promise

		// ResolvedTemplate: Function
		//		A constructor for content when the promise is resolved
		ResolvedTemplate: null,

		// ErrorTemplate: Function
		//		A constructor for content when the promise is rejected
		ErrorTemplate: null,

		// ProgressTemplate: Function
		//		A constructor for content when the promise reports progress
		ProgressTemplate: null,

		// promise: DataBindingExpression
		//		An expression indicating the promise to bind to
		promise: null,

		// TODO: Add valueName property that specifies what the callback parameter should be called in the data binding context.

		// content: ContentNode
		//		The active content for this template node
		content: null,

		_create: function (kwArgs) {
			this.inherited(arguments);

			var whenNode = this;

			function createContentArgs(value) {
				var contentArgs;
				if (whenNode.valueName) {
					var valueData = {};
					valueData[whenNode.valueName] = value;

					contentArgs = lang.delegate(kwArgs, {
						bindingContext: lang.delegate(kwArgs.bindingArgs, valueData)
					});
				}
				else {
					contentArgs = kwArgs;
				}
				return contentArgs;
			}

			function createCallback(constructorName) {
				var ContentNode = whenNode[constructorName];
				if (!ContentNode) {
					return null;
				}
				else {
					return function (value) {
						whenNode._destroyContent();
						whenNode.content = new ContentNode(createContentArgs(value));
						whenNode.content.placeAt(whenNode.endMarker, 'before');
					};
				}
			}

			this.promise.bind(kwArgs.bindingContext, function (promise) {
				promise && promise.then(
					createCallback('ResolvedTemplate'),
					createCallback('ErrorTemplate'),
					createCallback('ProgressTemplate')
				);
			});
		},

		_destroyContent: function () {
			// summary:
			//		Destroy the active content
			if (this.content) {
				this.content.destroy();
				this.content = null;
			}
		},

		destroy: function () {
			if (this.content) {
				this.content.destroy();
				this.content = null;
			}
		}
	});
});