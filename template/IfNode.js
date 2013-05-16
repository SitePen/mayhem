define([
	'dojo/_base/lang',
	'dojo/_base/declare',
	'./BoundNode'
], function (lang, declare, BoundNode) {
	return declare(BoundNode, {

		conditionalBlocks: null,
		elseBlock: null,

		view: null,
		content: null,

		_bind: function (view) {
			this.view = view;

			var conditionalBlocks = this.conditionalBlocks,
				update = lang.hitch(this, '_evaluateConditions');
			for (var i = 0; i < conditionalBlocks.length; i++) {
				// TODO: Is there a way to avoid having update() called when binding to each condition?
				conditionalBlocks[i].condition.bind(view, update);
			}
		},

		_evaluateConditions: function () {
			this._removeContent();

			var conditionalBlocks = this.conditionalBlocks,
				conditionalBlock,
				blockToApply;

			for (var i = 0; i < conditionalBlocks.length && !blockToApply; i++) {
				conditionalBlock = conditionalBlocks[i];
				if (conditionalBlock.condition.getValue(this.view)) {
					blockToApply = conditionalBlock;
				}
			}

			if (!blockToApply) {
				blockToApply = this.elseBlock;
			}

			if (blockToApply) {
				var content = this.content = new blockToApply.ContentConstructor(this.view);
				content.placeAt(this.endMarker, 'before');
			}
		},

		_removeContent: function () {
			if (this.content) {
				this.content.destroy();
				this.content = null;
			}
		}
	});
});