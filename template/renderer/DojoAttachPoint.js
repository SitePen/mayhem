define([], function () {

	function DojoAttachPointRender(astNode) {
		//	summary:
		//		Manages the rendering of an attach point
		//	astNode:
		//		The AST Node that describes this attach point

		this.points = astNode.points;
	}

	DojoAttachPointRender.prototype = {
		constructor: DojoAttachPointRender,

		render: function (view, context, template, obj) {
			//	summary:
			//		Sets an attach point on a View.
			//	view: framework/View
			//		The view being rendered
			//	context:
			//		The context used to resolve logic
			//	template: framework/Template
			//	obj:
			//		The value to be set as the attach point

			var points = this.points,
				i = 0,
				point;

			while ((point = points[i++])) {
				view.set(point, obj);
			}
		},

		unrender: function () {
			// ...
		},

		destroy: function () {
			// ...
		}
	};

	return DojoAttachPointRender;
});