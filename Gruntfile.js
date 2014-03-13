/* jshint node:true */

var path = require('path'),
	_ = require('lodash'),
	globule = require('globule');

module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('grunt-peg');
	grunt.loadNpmTasks('grunt-wrap');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('intern-geezer');

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
			},
			parser: {
				src: [
					'templating/html/peg/html.js*'
				]
			}
		},

		peg: {
			parser: {
				src: 'templating/html/peg/html.pegjs',
				dest: 'templating/html/peg/html.js.unwrapped.js',
				options: {
					allowedStartRules: ['Template', 'BoundText']
				}
			}
		},

		wrap: {
			parser: {
				src: [ 'templating/html/peg/html.js.unwrapped.js' ],
				dest: '.',
				expand: true,
				rename: function (dest, src) {
					return path.join(dest, src.replace(/\.unwrapped\.js$/, ''));
				},
				options: {
					indent: '  ',
					wrapper: [ 'define([\'module\'], function (module) {\n', '\n});' ]
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
				tasks: [ 'build-ts' ],
				options: {
					spawn: false
				}
			}
		},

		intern: {
			runner: {
				options: {
					runType: 'runner',
					config: 'tests/intern-local'
				}
			},
			templating: {
				options: {
					runType: 'runner',
					config: 'tests/intern-local',
					suites: [ 'mayhem/tests/templating' ],
					reporters: [ 'console' ]
				}
			},
			templatingCoverage: {
				options: {
					runType: 'runner',
					config: 'tests/intern-local',
					suites: [ 'mayhem/tests/templating' ],
					reporters: [ 'lcovhtml' ]
				}
			},
			binding: {
				options: {
					config: 'tests/intern',
					suites: [ 'mayhem/tests/binding' ],
					reporters: [ 'console', 'lcovhtml' ]
				}
			},
			pb: {
				options: {
					config: 'tests/intern',
					suites: [ 'mayhem/tests/binding/ProxtyBinder' ],
					reporters: [ 'console', 'lcovhtml' ]
				}
			},
			bindingRunner: {
				options: {
					runType: 'runner',
					config: 'tests/intern',
					suites: [ 'mayhem/tests/binding' ],
					reporters: [ 'console', 'lcovhtml' ]
				}
			},
			client: {
				options: {
					config: 'tests/intern'
				}
			}
		}
	});

	grunt.registerTask('parser', [ 'peg:parser', 'wrap:parser', 'cleanupParser' ]);
	grunt.registerTask('cleanupParser', function () {
		// removes intermediate unwrapped file generated by pegjs
		if (grunt.file.isFile('templating/html/peg/html.js.unwrapped.js')) {
			grunt.file['delete']('templating/html/peg/html.js.unwrapped.js');
		}
	});
	grunt.registerTask('test', [ 'intern:client' ]);

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

	grunt.registerTask('build', function () {
		grunt.task.run(['force:on', 'parser', 'ts:framework', 'force:restore']);
	});
	grunt.registerTask('build-ts', function () {
		grunt.task.run(['force:on', 'ts:framework', 'force:restore']);
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
