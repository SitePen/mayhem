define([
	'dojo/_base/lang',
	'dojo/_base/declare',
	'./Node'
], function (lang, declare, Node) {
	return declare(Node, {
		// summary:
		//		Template node for conditionally displaying content depending on an if/elseif/else structure

		// conditionalBlocks: Array
		//		An array of objects with condition and ContentTemplate properties.
		conditionalBlocks: null,

		// elseBlock:
		//		An object containing a ContentTemplate used to instantiate content when
		// 		no conditonal blocks evaluate to true.
		elseBlock: null,

		// content: ContentNode
		//		The active content for this template node
		content: null,

		_create: function (kwArgs) {
			this.inherited(arguments);
			var conditionalBlocks = this.conditionalBlocks,
				update = lang.hitch(this, '_evaluateConditions', kwArgs);
			for (var i = 0; i < conditionalBlocks.length; i++) {
				// TODO: Is there a way to avoid having update() called when binding to each condition?
				conditionalBlocks[i].condition.bind(kwArgs.bindingContext, update);
			}
		},

		_evaluateConditions: function (kwArgs) {
			// summary:
			//		Evaluate conditions and apply earliest block that evaluates to true.
			// kwArgs:
			//		The data binding args
			this._destroyContent();

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
				var content = this.content = new blockToApply.ContentTemplate(kwArgs);
				content.placeAt(this.endMarker, 'before');
			}
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
			this._destroyContent();
			this.inherited(arguments);
		}
	});
});