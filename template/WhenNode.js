define([
	'dojo/_base/declare',
	'./BoundNode'
], function (declare, BoundNode) {
	return declare(BoundNode, {

		ResolvedTemplate: null,
		ErrorTemplate: null,
		ProgressTemplate: null,

		promiseName: null,
		content: null,

		_bind: function (view) {
			var whenNode = this;
			function removeExistingContent() {
				whenNode.content.destroy();
				whenNode.content = null;
			}

			this._applyBindingExpression(this.promiseName, view, function (promise) {
				// TODO: Make promise callback params available to template data binding.
				// TODO: Cleanup!
				promise && promise.then(
					function (value) {
						removeExistingContent();
						whenNode.content = new whenNode.ResolvedTemplate();
					},
					function (error) {
						removeExistingContent();
						whenNode.content = new whenNode.ErrorTemplate();
					},
					function (progress) {
						removeExistingContent();
						whenNode.content = new whenNode.ProgressTemplate();
					}
				);
			});
		}
	});
});