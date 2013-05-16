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

		_bind: function (view, options, context) {
			var whenNode = this;
			this.promise.bind(context, function (promise) {
				// TODO: Cleanup!
				promise && promise.then(
					function (value) {
						whenNode.content.destroy();
						whenNode.content = new whenNode.ResolvedTemplate(view, options);
					},
					function (error) {
						whenNode.content.destroy();
						whenNode.content = new whenNode.ErrorTemplate(view, options);
					},
					function (progress) {
						whenNode.content.destroy();
						whenNode.content = new whenNode.ProgressTemplate(view, options);
					}
				);
			});
		}
	});
});