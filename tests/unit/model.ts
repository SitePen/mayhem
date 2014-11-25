/// <reference path="../intern.d.ts" />
/// <amd-dependency path="module" />

import Deferred = require('intern/dojo/Deferred');
import generator = require('intern/dojo/node!yeoman-generator');
import path = require('intern/dojo/node!path');
import registerSuite = require('intern!object');
import rimraf = require('intern/dojo/node!rimraf');

var app:generator.IYeomanGenerator;
declare var arguments:any;
var helpers = generator.test;
var module:any = arguments[arguments.length - 1];
var tempDir = path.join(path.dirname(module.uri), 'temp');

registerSuite({
	name: 'model generator',

	beforeEach():IPromise<void> {
		var dfd = new Deferred<void>();

		helpers.testDirectory(tempDir, function (err:Error):void {
			if (err) {
				dfd.reject(err);
				return;
			}

			app = helpers.createGenerator('mayhem:model', [
				'../../../model'
			], 'Bar');

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

	'no store, no test'():void {
		var dfd = this.async();

		helpers.mockPrompt(app, {
			persistent: false,
			unitTest: false
		});
		app.run({}, dfd.callback(function ():void {
			helpers.assertFile([
				'src/app/models/BarModel.ts'
			]);
			helpers.assertNoFile([
				'src/app/tests/unit/models/BarModel.ts'
			]);
			helpers.assertFileContent([
				[ 'src/app/models/BarModel.ts', /class BarModel extends Model {/ ]
			]);
		}));
	},

	'no store, test'():void {
		var dfd = this.async();

		helpers.mockPrompt(app, {
			persistent: false,
			unitTest: true
		});
		app.run({}, dfd.callback(function ():void {
			helpers.assertFile([
				'src/app/models/BarModel.ts',
				'src/app/tests/unit/models/BarModel.ts'
			]);
			helpers.assertFileContent([
				[ 'src/app/models/BarModel.ts', {
					test: function (body:string):boolean {
						return body.indexOf('PersistentModel') === -1 && body.indexOf('class BarModel extends Model {') > -1;
					}
				} ],
				[ 'src/app/tests/unit/models/BarModel.ts', {
					test: function (body:string):boolean {
						return body.indexOf('import TestStore') === -1;
					}
				} ]
			]);
		}));
	},

	'store, no test'():void {
		var dfd = this.async();

		helpers.mockPrompt(app, {
			persistent: true,
			unitTest: false
		});
		app.run({}, dfd.callback(function ():void {
			helpers.assertFile([
				'src/app/models/BarModel.ts'
			]);
			helpers.assertNoFile([
				'src/app/tests/unit/models/BarModel.ts'
			]);
			helpers.assertFileContent([
				[ 'src/app/models/BarModel.ts', /class BarModel extends PersistentModel {/ ]
			]);
		}));
	},

	'store, test'():void {
		var dfd = this.async();

		helpers.mockPrompt(app, {
			persistent: true,
			unitTest: true
		});
		generator.file.write(path.join(tempDir, 'src/app/tests/unit/all.ts'), '');
		app.run({}, dfd.callback(function ():void {
			helpers.assertFile([
				'src/app/models/BarModel.ts',
				'src/app/tests/unit/models/BarModel.ts'
			]);
			helpers.assertFileContent([
				[ 'src/app/models/BarModel.ts', /class BarModel extends PersistentModel {/ ],
				[ 'src/app/tests/unit/models/BarModel.ts', /import TestStore/ ]
			]);
		}));
	}
});
