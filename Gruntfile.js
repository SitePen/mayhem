/* jshint node:true */

module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('grunt-peg');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('intern-geezer');

	grunt.initConfig({
		// TODO: Always build, or never build, tests
		all: [ '**/*.ts', '!node_modules/**/*.ts', '!**/tests/integration/**' ],
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
				dest: 'templating/html/peg/html.js',
				options: {
					allowedStartRules: ['Template', 'BoundText'],
					wrapper: function (src, parser) {
						return 'define([\'require\', \'module\'], function (require, module) {\n' +
							'return ' + parser + ';\n' +
						'});';
					}
				}
			}
		},

		ts: {
			options: {
				target: 'es5',
				module: 'amd',
				sourceMap: true,
				noImplicitAny: true,
				fast: 'never'
			},
			framework: {
				src: [ '<%= ignoreDefinitions %>' ]
			}
		},

		watch: {
			ts: {
				files: [ '<%= all %>' ],
				tasks: [ 'ts:framework' ]
			},
			parser: {
				files: [ '<%= peg.parser.src %>' ],
				tasks: [ 'peg:parser' ]
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
					runType: 'runner',
					config: 'tests/intern-local',
					suites: [ 'mayhem/tests/binding' ],
					reporters: [ 'console' ]
				}
			},
			bindingCover: {
				options: {
					runType: 'runner',
					config: 'tests/intern-local',
					suites: [ 'mayhem/tests/binding' ],
					reporters: [ 'lcovhtml' ]
				}
			},
			ui: {
				options: {
					runType: 'runner',
					config: 'tests/intern-local',
					suites: [ 'mayhem/tests/ui' ],
					reporters: [ 'console' ]
				}
			},
			uiCoverage: {
				options: {
					runType: 'runner',
					config: 'tests/intern-local',
					suites: [ 'mayhem/tests/ui' ],
					reporters: [ 'lcovhtml' ]
				}
			},
			data: {
				options: {
					config: 'tests/intern',
					suites: [ 'mayhem/tests/data' ]
				}
			},
			client: {
				options: {
					config: 'tests/mayhem.intern'
				}
			}
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

	grunt.registerTask('build', ['force:on', 'peg:parser', 'force:restore', 'ts:framework']);
	grunt.registerTask('default', ['force:on', 'peg:parser', 'ts:framework', 'force:restore', 'watch']);
};
