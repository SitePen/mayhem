/// <reference path="../intern.d.ts" />

import Deferred = require('intern/dojo/Deferred');
import generator = require('intern/dojo/node!yeoman-generator');
import path = require('intern/dojo/node!path');
import registerSuite = require('intern!object');
import rimraf = require('intern/dojo/node!rimraf');

var dirname = (<any> require).toUrl('./');
var helpers = generator.test;
var tempDir = path.join(dirname, 'temp');

function run(clean:boolean = true):generator.IRunContext {
	var context = helpers.run(path.resolve(dirname, '../../model'));

	if (clean) {
		context = context.inDir(tempDir);
	}

	return context;
}

registerSuite({
	name: 'model generator',

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

		run().withArguments([ 'foo', '--force' ])
			.withPrompts({
				persistent: false,
				unitTest: false
			})
			.on('end', dfd.callback(function ():void {
				helpers.assertFile([
					'src/app/models/FooModel.ts'
				]);
				helpers.assertNoFile([
					'src/app/tests/unit/models/FooModel.ts'
				]);
				helpers.assertFileContent([
					[ 'src/app/models/FooModel.ts', /class FooModel extends Model {/ ]
				]);
			}));
	},

	'no store, test'():void {
		var dfd = this.async();

		run().withArguments([ 'foo', '--force' ])
			.withPrompts({
				persistent: false,
				unitTest: true
			})
			.on('end', dfd.callback(function ():void {
				helpers.assertFile([
					'src/app/models/FooModel.ts',
					'src/app/tests/unit/models/FooModel.ts'
				]);
				helpers.assertFileContent([
					[ 'src/app/models/FooModel.ts', {
						test: function (body:string):boolean {
							return body.indexOf('PersistentModel') === -1 && body.indexOf('class FooModel extends Model {') > -1;
						}
					} ],
					[ 'src/app/tests/unit/models/FooModel.ts', {
						test: function (body:string):boolean {
							return body.indexOf('import TestStore') === -1;
						}
					} ]
				]);
			}));
	},

	'store, no test'():void {
		var dfd = this.async();

		run().withArguments([ 'foo', '--force' ])
			.withPrompts({
				persistent: true,
				unitTest: false
			})
			.on('end', dfd.callback(function ():void {
				helpers.assertFile([
					'src/app/models/FooModel.ts'
				]);
				helpers.assertNoFile([
					'src/app/tests/unit/models/FooModel.ts'
				]);
				helpers.assertFileContent([
					[ 'src/app/models/FooModel.ts', /class FooModel extends PersistentModel {/ ]
				]);
			}));
	},

	'store, test'():void {
		var dfd = this.async();

		run().withArguments([ 'foo', '--force' ])
			.withPrompts({
				persistent: true,
				unitTest: true
			})
			.on('end', dfd.rejectOnError(function ():void {
				run(false).withArguments([ 'bar', '--force' ])
					.withPrompts({
						persistent: true,
						unitTest: true
					})
					.on('end', dfd.callback(function ():void {
						helpers.assertFile([
							'src/app/models/FooModel.ts',
							'src/app/models/BarModel.ts',
							'src/app/tests/unit/models/FooModel.ts',
							'src/app/tests/unit/models/BarModel.ts'
						]);
						helpers.assertFileContent([
							[ 'src/app/models/FooModel.ts', /class FooModel extends PersistentModel {/ ],
							[ 'src/app/models/BarModel.ts', /class BarModel extends PersistentModel {/ ],
							[ 'src/app/tests/unit/models/FooModel.ts', /import TestStore/ ],
							[ 'src/app/tests/unit/models/BarModel.ts', /import TestStore/ ],
							[ 'src/app/tests/unit/all.ts', /^import models/m ],
							[ 'src/app/tests/unit/models/all.ts', /import BarModel(?:.|\s)*import FooModel/ ]
						]);
					}));
			}));
	}
});
