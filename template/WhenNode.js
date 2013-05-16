define([
	'dojo/_base/declare',
	'./BoundNode'
], function (declare, BoundNode) {
	return declare(BoundNode, {

		ResolvedTemplate: null,
		ErrorTemplate: null,
		ProgressTemplate: null,

		promise: null,
		// TODO: Add valueName property that specifies what the callback parameter should be called in the data binding context.
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
						whenNode.content = new whenNode.ProgressTemplate(kwArgs);
					}
				);
			});
		}
	});
});