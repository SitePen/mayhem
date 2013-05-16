define([
	'dojo/_base/lang',
	'dojo/_base/declare',
	'./BoundNode'
], function (lang, declare, BoundNode) {
	return declare(BoundNode, {

		conditionalBlocks: null,
		elseBlock: null,

		content: null,

		_bind: function (view, options, context) {
			var conditionalBlocks = this.conditionalBlocks,
				update = lang.hitch(this, '_evaluateConditions', view, options, context);
			for (var i = 0; i < conditionalBlocks.length; i++) {
				// TODO: Is there a way to avoid having update() called when binding to each condition?
				conditionalBlocks[i].condition.bind(context, update);
			}
		},

		_evaluateConditions: function (view, options, context, value) {
			this._removeContent();

			var conditionalBlocks = this.conditionalBlocks,
				conditionalBlock,
				blockToApply;

			for (var i = 0; i < conditionalBlocks.length && !blockToApply; i++) {
				conditionalBlock = conditionalBlocks[i];
				if (conditionalBlock.condition.getValue(context)) {
					blockToApply = conditionalBlock;
				}
			}

			if (!blockToApply) {
				blockToApply = this.elseBlock;
			}

			if (blockToApply) {
				var content = this.content = new blockToApply.ContentConstructor(context);
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