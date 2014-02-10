/* jshint node:true */

var path = require('path'),
	_ = require('lodash'),
	globule = require('globule');

module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.initConfig({
		all: [ '**/*.ts', '!node_modules/**/*.ts' ],
		ignoreDefinitions: [ '<%= all %>', '!**/*.d.ts' ],

		clean: {
			framework: {
				src: [
					'**/*.js', '**/*.d.ts', '**/*.js.map', '!node_modules/**/*'
				],
				filter: function (filepath) {
					// Only clean the file if there is an associated .ts file
					var sourceFile = filepath.match(/(.*)\.(?:js(?:\.map)?|d\.ts)$/)[1] + '.ts';

					return grunt.file.exists(filepath) && grunt.file.isFile(sourceFile);
				}
			}
		},

		ts: {
			options: {
				target: 'es5',
				module: 'amd',
				sourceMap: true,
				noImplicitAny: true
			},
			framework: {
				src: [ '<%= ignoreDefinitions %>' ]
			}
		},

		watch: {
			all: {
				files: [ '<%= all %>' ],
				tasks: [ 'build' ],
				options: {
					spawn: false
				}
			}
		}
	});

	var previousForceState = grunt.option('force');
	grunt.registerTask('force', function (set) {
		if (set === 'on') {
			grunt.option('force', true);
		}
		else if (set === 'off') {
			grunt.option('force', false);
		}
		else if (set === 'restore') {
			grunt.option('force', previousForceState);
		}
	});

	// TODO: the following two tasks can be removed when grunt-ts 1.6.5 is released
	grunt.registerTask('cleanupBuild', function () {
		if (grunt.file.isFile('tscommand.tmp.txt')) {
			grunt.file['delete']('tscommand.tmp.txt');
		}
	});
	grunt.registerTask('build', function () {
		grunt.task.run(['force:on', 'ts:framework', 'force:restore', 'cleanupBuild']);
	});
	grunt.registerTask('default', function () {
		var dependsOn = {},
			commentsRE = /\/\*[\s\S]*?\*\/|\/\/.*$/mg,
			importRE = /import\s+\w+\s+=\s+require\(\s*(['"])(\..*?[^\\])\1\s*\)/g,
			referenceRE = /\/\/\/\s+<reference\s+path="(.*?)\.d\.ts"\s*?\/>/g;

		function analyzeDependencies(filepath, action) {
			if (typeof action === 'string' && action !== 'added') {
				for (var key in dependsOn) {
					if (dependsOn[key].length) {
						var index = dependsOn[key].indexOf(filepath);
						if (index > -1) {
							dependsOn[key].splice(index, 1);
						}
					}
				}
			}
			if (action === 'removed') {
				return;
			}
			var deps = [];
			grunt.file.read(filepath)
				.replace(referenceRE, function (whole, dep) {
					deps.push(dep);

					return whole;
				})
				.replace(commentsRE, '')
				.replace(importRE, function (whole, quote, dep) {
					deps.push(dep);

					return whole;
				});

			if (!deps.length) {
				return;
			}

			var dirname = path.dirname(filepath);
			deps.forEach(function (dep) {
				dep = path.normalize(path.join(dirname, dep));

				if (!dependsOn[dep]) {
					dependsOn[dep] = [filepath];
				}
				else {
					dependsOn[dep].push(filepath);
				}
			});
		}

		function getDependents(filepath, seen) {
			filepath = filepath.replace(/(?:\.d)?\.ts$/, '');
			seen = seen || [];

			var res = [];
			if (seen.indexOf(filepath) > -1) {
				return res;
			}

			seen.push(filepath);
			if (filepath in dependsOn) {
				dependsOn[filepath].forEach(function (filepath) {
					res.push(filepath);
					var _res = getDependents(filepath, seen);
					if (_res.length) {
						res.push.apply(res, _res);
					}
				});
			}

			return res;
		}

		var patterns = _.chain(grunt.config.get('watch.all.files')).flatten().map(function (pattern) {
			return grunt.config.process(pattern);
		}).value();

		globule.find(patterns).forEach(analyzeDependencies);

		var recompile = {};
		var onChange = _.debounce(function () {
			var files = grunt.file.match(grunt.config.get('ignoreDefinitions'), Object.keys(recompile));

			grunt.config.set('ts.framework.src', files);

			recompile = {};
		}, 200);

		grunt.event.on('watch', function (action, filepath) {
			if (grunt.file.isFile(filepath)) {
				recompile[filepath] = action;

				analyzeDependencies(filepath, action);

				getDependents(filepath).forEach(function (filepath) {
					recompile[filepath] = true;
				});
			}
			onChange();
		});

		grunt.task.run([ 'build', 'watch' ]);
	});
};
