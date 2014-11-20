/// <reference path="../intern.d.ts" />
/// <amd-dependency path="module" />

import Deferred = require('intern/dojo/Deferred');
import generator = require('intern/dojo/node!yeoman-generator');
import path = require('intern/dojo/node!path');
import registerSuite = require('intern!object');
import rimraf = require('intern/dojo/node!rimraf');

var app:generator.IYeomanGenerator;
declare var arguments:any;
var expectedFiles:string[] = [
	'.bowerrc',
	'.gitignore',
	'.jshintrc',
	'.yo-rc.json',
	'bower.json',
	'tslint.json',
	'src/index.html',
	'src/app/main.ts',
	'src/app/viewModels/Index.ts',
	'src/app/views/Application.html',
	'src/app/views/Index.html'
];
var helpers = generator.test;
var module:any = arguments[arguments.length - 1];
var tempDir = path.join(path.dirname(module.uri), 'temp');

registerSuite({
	name: 'mayhem app generator',

	beforeEach():IPromise<void> {
		var dfd = new Deferred<void>();

		helpers.testDirectory(tempDir, function (err:Error):void {
			if (err) {
				dfd.reject(err);
				return;
			}

			app = helpers.createGenerator('mayhem:app', [
				'../../../app'
			]);

			dfd.resolve(undefined);
		});

		return dfd.promise;
	},

	after():IPromise<void> {
		var dfd = new Deferred<void>();

		// Make sure we're not deleting CWD by moving to the temp directory's
		// parent directory
		process.chdir(path.dirname(tempDir));

		// Clean up the temp directory after everything is done
		rimraf(tempDir, function (err:Error):void {
			if (err) {
				dfd.reject(err);
				return;
			}

			dfd.resolve(undefined);
		});

		return dfd.promise;
	},

	'es3-no-stylus'():void {
		var dfd = this.async();

		helpers.mockPrompt(app, {
			appTitle: 'Test App',
			oldBrowsers: true,
			stylus: false,
			nib: false
		});
		app.options['skip-install'] = true;
		app.run({}, dfd.callback(function ():void {
			helpers.assertFile(expectedFiles.concat([
				'src/app/resources/main.css'
			]));
			helpers.assertFileContent([
				[ 'bower.json', /"name": "temp"/ ],
				[ 'Gruntfile.js', {
					test: function (body:string):boolean {
						return body.indexOf('grunt-contrib-stylus') === -1;
					}
				} ],
				[ 'package.json', /"intern-geezer"/ ],
				[ 'src/app/main.ts', /name: 'Test App'/ ]
			]);
		}));
	},

	'es5-stylus-no-nib'():void {
		var dfd = this.async();

		helpers.mockPrompt(app, {
			appTitle: 'Test App',
			oldBrowsers: false,
			stylus: true,
			nib: false
		});
		app.options['skip-install'] = true;
		app.run({}, dfd.callback(function ():void {
			helpers.assertFile(expectedFiles.concat([
				'src/app/resources/main.styl'
			]));
			helpers.assertFileContent([
				[ 'bower.json', /"name": "temp"/ ],
				[ 'Gruntfile.js', /grunt-contrib-stylus/ ],
				[ 'package.json', {
					test: function (body:string):boolean {
						return body.indexOf('"intern"') > -1 && body.indexOf('"nib"') === -1;
					}
				} ],
				[ 'src/app/main.ts', /name: 'Test App'/ ],
				[ 'src/app/resources/main.styl', {
					test: function (body:string):boolean {
						return body.indexOf('@require \'nib\';') === -1;
					}
				} ]
			]);
		}));
	},

	'es5-stylus-nib'():void {
		var dfd = this.async();

		helpers.mockPrompt(app, {
			appTitle: 'Test App',
			oldBrowsers: false,
			stylus: true,
			nib: true
		});
		app.options['skip-install'] = true;
		app.run({}, dfd.callback(function ():void {
			helpers.assertFile(expectedFiles.concat([
				'src/app/resources/main.styl'
			]));
			helpers.assertFileContent([
				[ 'bower.json', /"name": "temp"/ ],
				[ 'Gruntfile.js', /grunt-contrib-stylus/ ],
				[ 'package.json', {
					test: function (body:string):boolean {
						return body.indexOf('"stylus"') > -1 && body.indexOf('"nib"') > -1;
					}
				} ],
				[ 'src/app/main.ts', /name: 'Test App'/ ],
				[ 'src/app/resources/main.styl', /@require 'nib';/ ]
			]);
		}));
	}
});
