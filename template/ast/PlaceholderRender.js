define([
	'./Renderers',
	'dbind/bind'
], function (Renderers, bind) {

	function PlaceholderRender(program) {
		//	summary:
		//		Manages the rendering and updating of a BlockNode
		//	astNode:
		//		The AST node that describes this Block

		console.log('PlaceholderRender', arguments);
	}

	PlaceholderRender.prototype = {
		constructor: PlaceholderRender,

		render: function (context, template) {
			//	summary:
			//		TODOC
			//	context:
			//		The context for resolving references to variables
			//	template: framework/Template
			//	returns: DOMElement

			console.log('PlaceholderRender#render');
		},

		unrender: function (node) {
			// TODO:
		},

		destroy: function () {
			// TODO:
		}
	};

	return PlaceholderRender;
});