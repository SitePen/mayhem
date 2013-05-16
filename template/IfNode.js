define([
	'dojo/_base/lang',
	'dojo/_base/declare',
	'./BoundNode'
], function (lang, declare, BoundNode) {
	return declare(BoundNode, {

		conditionalBlocks: null,
		elseBlock: null,

		content: null,

		_bind: function (kwArgs) {
			var conditionalBlocks = this.conditionalBlocks,
				update = lang.hitch(this, '_evaluateConditions', kwArgs);
			for (var i = 0; i < conditionalBlocks.length; i++) {
				// TODO: Is there a way to avoid having update() called when binding to each condition?
				conditionalBlocks[i].condition.bind(kwArgs.bindingContext, update);
			}
		},

		_evaluateConditions: function (kwArgs, value) {
			this._removeContent();

			var conditionalBlocks = this.conditionalBlocks,
				conditionalBlock,
				blockToApply;

			for (var i = 0; i < conditionalBlocks.length && !blockToApply; i++) {
				conditionalBlock = conditionalBlocks[i];
				if (conditionalBlock.condition.getValue(kwArgs.bindingContext)) {
					blockToApply = conditionalBlock;
				}
			}

			if (!blockToApply) {
				blockToApply = this.elseBlock;
			}

			if (blockToApply) {
				var content = this.content = new blockToApply.ContentConstructor(kwArgs);
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