define(['require'], function (require) {
	// in addition to this plugin, there should be a counterpart for the build system that will
	// compile the strings, output an AMD module that exports the compiled template, and updates
	// module ids in the reference module to replace the whole "framework/template!./some/module"
	// dependency with "./some/module".
	// as a matter of convenience, if a module is already compiled, and you're using it during
	// development, you can append an '!' to the module id.  ...but, why would you?
	//
	// this strategy makes it possible to have build code that doesn't need this plugin, the
	// compiler, or the original template file.

	return {
		// ./foo/bar -> load dojo/text!./foo/bar.html and compile
		// ./foo/bar! -> assume it's an AMD module that exports a function (the compiled template)
		normalize: function (id, toAbsMid) {
			var parts = id.split('!'),
				url = parts[0];

			return (url.charAt(0) === '.' ? toAbsMid(url) : url) +
				(parts[1] ? '!' + parts[1] : '.html');
		},

		load: function (id, moduleRequire, load) {
			var parts = id.split('!'),
				isCompiled = parts.length > 1,
				mid = parts[0];

			// for compiled templates, treat them like an AMD dependency
			if (isCompiled) {
				moduleRequire([mid], load);
			}
			// uncompiled templates need to be treated like a text file
			// we lazy-load the compiler so that we don't need to include it after a build.
			// although... if all goes well, the plugin won't even be included in a built layer.
			else {
				// ./template/compiler is our code to parse and compile the template string.  this
				// same module would be leveraged by the build plugin to produce the compiled
				// function exported by the AMD module that replaces this dependency.
				require(['./template/compiler', 'dojo/text!' + mid], function (compile, template) {
					load(compile, template);
				});
			}
		}
	};
});