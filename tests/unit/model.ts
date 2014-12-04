import GeneratorTester = require('./GeneratorTester');
import generator = require('intern/dojo/node!yeoman-generator');
import registerSuite = require('intern!object');

var helpers = generator.test;
var tester = new GeneratorTester({
	require: <any> require,
	path: '../../model'
});

registerSuite({
	name: 'model generator',

	after: tester.clean,

	'no store, no test': tester.withArguments([ 'foo', '--force' ])
		.withPrompts({
			persistent: false,
			unitTest: false
		})
		.then(function ():void {
			helpers.assertFile([
				'src/app/models/FooModel.ts'
			]);
			helpers.assertNoFile([
				'src/app/tests/unit/models/FooModel.ts'
			]);
			helpers.assertFileContent([
				[ 'src/app/models/FooModel.ts', /class FooModel extends Model {/ ]
			]);
		}),

	'no store, test': tester.withArguments([ 'foo', '--force' ])
		.withPrompts({
			persistent: false,
			unitTest: true
		})
		.then(function ():void {
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
		}),

	'store, no test': tester.withArguments([ 'foo', '--force' ])
		.withPrompts({
			persistent: true,
			unitTest: false
		})
		.then(function ():void {
			helpers.assertFile([
				'src/app/models/FooModel.ts'
			]);
			helpers.assertNoFile([
				'src/app/tests/unit/models/FooModel.ts'
			]);
			helpers.assertFileContent([
				[ 'src/app/models/FooModel.ts', /class FooModel extends PersistentModel {/ ]
			]);
		}),

	'store, test': tester.withArguments([ 'foo', '--force' ])
		.withPrompts({
			persistent: true,
			unitTest: true
		})
		.then(function ():void {
			var dfd = this.async();
			tester.run(false).withArguments([ 'bar', '--force' ])
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
		})
});
