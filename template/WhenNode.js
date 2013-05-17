define([
	'dojo/_base/declare',
	'./BoundNode'
], function (declare, BoundNode) {
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

		_bind: function (kwArgs) {
			var whenNode = this;
			this.promise.bind(kwArgs.bindingContext, function (promise) {
				// TODO: Cleanup!
				promise && promise.then(
					function (value) {
						whenNode.content.destroy();
						whenNode.content = new whenNode.ResolvedTemplate(kwArgs);
					},
					function (error) {
						whenNode.content.destroy();
						whenNode.content = new whenNode.ErrorTemplate(kwArgs);
					},
					function (progress) {
						whenNode.content.destroy();
						if (whenNode.ProgressTemplate) {
							whenNode.content = new whenNode.ProgressTemplate(kwArgs);
						}
					}
				);
			});
		},

		destroy: function () {
			if (this.content) {
				this.content.destroy();
				this.content = null;
			}
		}
	});
});