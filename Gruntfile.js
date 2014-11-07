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
					config: 'tests/mayhem.intern'
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
	grunt.registerTask('build', [ 'peg:parser', 'ts:framework' ]);
	grunt.registerTask('default', [ 'peg:parser', 'ts:framework', 'watch' ]);
};
