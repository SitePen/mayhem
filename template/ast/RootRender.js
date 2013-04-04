define([
	'dojo/_base/array',
	'dbind/bind',
	'./Renderers'
], function (array, bind, Renderers) {

	function RootRender(astRoot) {
		//	summary:
		//		A renderer for the root of an AST.  It is intended that an instance of this should
		//		be mixed into Template.

		var program = astRoot.program,
			url = astRoot.sourceUrl || 'unkown location',
			root = program[0];

		if (program.length > 1) {
			// TODO: we could possibly return a document fragment if there was more than one
			// top-level node but for now we'll say we don't support it.
			throw new Error('More than one top-level node specified in "' + url + '"');
		}

		console.log('creating RootRender for', astRoot);

		this.root = new Renderers[root.type](root);
	}

	RootRender.prototype = {
		constructor: RootRender,

		render: function (view) {
			console.log('rendering', view);

			var template = this;

			// use a bound context so that if the viewModel property of the view changes, we react
			return bind(view).get('viewModel').receive(function (context) {
				var root = template.root,
					node = view.domNode;

				root.unrender(node);
				view.set('domNode', root.render(context, template));
			});
		},

		unrender: function (view) {
			this.root.unrender(view.domNode);
		},

		destroy: function () {
			// TODO:
		}
	};

	return RootRender;
});