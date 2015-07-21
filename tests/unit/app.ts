import GeneratorTester = require('./GeneratorTester');
import generator = require('intern/dojo/node!yeoman-generator');
import registerSuite = require('intern!object');

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
	'src/app/routes/Index.ts',
	'src/app/views/Application.html',
	'src/app/views/Index.html',
	'src/app/tests/app.intern.ts',
	'src/app/tests/functional/all.ts',
	'src/app/tests/unit/all.ts'
];
var helpers = generator.test;
var tester = new GeneratorTester({
	require: <any> require,
	path: '../../app'
});

registerSuite({
	name: 'mayhem app generator',

	after: tester.clean,

	'es3-no-stylus': tester.withOptions({ 'skip-install': true })
		.withPrompts({
			appTitle: 'Test App',
			oldBrowsers: true,
			stylus: false,
			nib: false
		})
		.then(function ():void {
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
		}),

	'es5-stylus-no-nib': tester.withOptions({ 'skip-install': true })
		.withPrompts({
			appTitle: 'Test App',
			oldBrowsers: false,
			stylus: true,
			nib: false
		})
		.then(function ():void {
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
		}),

	'es5-stylus-nib': tester.withOptions({ 'skip-install': true })
		.withPrompts({
			appTitle: 'Test App',
			oldBrowsers: false,
			stylus: true,
			nib: true
		})
		.then(function ():void {
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
		})
});
