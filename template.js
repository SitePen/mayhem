define([
	'require',
	'dojo/_base/array',
	'dojo/_base/lang',
	'dojo/dom-construct',
	'dojo/on',
	'dojo/aspect',
	'dojo/string',
	'./template/compiler'
], function (require, array, lang, domConstruct, on, aspect, string, compiler) {
	// in addition to this plugin, there should be a counterpart for the build system that will
	// compile the strings, output an AMD module that exports the compiled template, and updates
	// module ids in the reference module to replace the whole "framework/template!./some/module"
	// dependency with "./some/module".

	// during development, if you're using a module that is already compiled, just don't provide
	// an extension for the module id and it will be assumed to be compiled eg:
	//	not compiled:
	//		'framework/template!./template/View.html'
	//	compiled:
	//		'framework/template!./template/View'

	var includesExtension = /\..*$/,
		templateCache = {};

	return {
		load: function (id, moduleRequire, load) {
			//	summary:
			//		An AMD plugin for loading templates.  This handles both raw and compiled templates.

			// for templates without an extension, treat them like an AMD dependency.
			// this implies a compiled template AST.

			// TODO: Add build support for producing template AST modules.

			function complete(renderer) {
				var template = new Template(renderer);

				templateCache[sourceUrl] = template;

				load(template);
			}

			var sourceUrl = moduleRequire.toUrl(id),
				cachedTemplate = templateCache[sourceUrl];

			if (cachedTemplate) {
				return load(cachedTemplate);
			}

			if (!includesExtension.test(id)) {
				require([id], function (templateAst) {
					compiler.compileFromAst(templateAst).then(load);
				});
			}
			// templates with extensions are treated like a text file.
			else {
				// ./template/compiler is our code to parse and compile the template string.  this
				// same module would be leveraged by the build plugin to produce the compiled
				// function exported by the AMD module that replaces this dependency.
				require([ 'dojo/text!' + id], function (templateString) {
					compiler.compileFromSource(templateString).then(load);

					// TODO: cache the results based on sourceUrl?
				});
			}
		}
	};
});