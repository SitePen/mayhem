define([], function () {

	function ContentRenderer(astNode) {
		//	summary:
		//		Manages the rendering of content that is just plain text.
		//	astNode:
		//		The AST node describing the content to be rendered

		this.content = astNode.content;
	}

	ContentRenderer.prototype = {
		constructor: ContentRenderer,

		render: function () {
			//	summary:
			//		Render plain text.
			//	returns: string
			//		The plain text.

			return this.content;
		},

		unrender: function () {

		},

		destroy: function () {

		}
	};

	return ContentRenderer;
});