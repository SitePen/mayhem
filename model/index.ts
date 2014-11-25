/// <reference path="../node" />
/// <reference path="../yeoman-generator" />

import yeoman = require('yeoman-generator');

var ModelGenerator = yeoman.generators.NamedBase.extend({
	constructor():void {
		yeoman.generators.NamedBase.apply(this, arguments);

		this.modelName = this._.camelize(this.name + '-model');
	},

    initializing():void {
        this.log('app/models/' + this.modelName);
    },

	prompting():void {
		var done:Function = this.async();

		this.prompt([
			{
				type: 'confirm',
				name: 'persistent',
				message: 'Will this model be used with a store?',
				default: true
			},
			{
				type: 'input',
				name: 'store',
				message: 'Which store will be used?',
				when: function (answers:any):boolean {
					return answers.persistent;
				},
				default: 'dstore/Memory'
			},
			{
				type: 'confirm',
				name: 'unitTest',
				message: 'Would you like a unit test generated?',
				default: true
			}
		], function (answers:any):void {
			this.persistent = answers.persistent;
			this.store = answers.store;
			this.unitTest = answers.unitTest;

			done();
		}.bind(this));
	},

	writing: {
		model():void {
			var file:string = this.persistent ? '_PersistentModel.ts' : '_Model.ts';
			this.copy(file, 'src/app/models/' + this.modelName + '.ts');
		},
		unitTest():void {
			if (this.unitTest) {
				this.copy('_Test.ts', 'src/app/tests/unit/models/' + this.modelName + '.ts');

				var allTests = this.dest.read('src/app/tests/unit/all.ts');
				var modelImportStatement = 'import models = require(\'./models/all\'); models;';
				if (allTests.indexOf(modelImportStatement) === -1) {
					// TODO: this is wrong
					this.dest.write('src/app/tests/unit/all.ts', allTests + '\n' + modelImportStatement + '\n');
				}

				if (!this.dest.exists('src/app/tests/unit/models/all.ts')) {
					this.dest.write('src/app/tests/unit/models/all.ts', '\n');
				}

				var all = this.dest.read('src/app/tests/unit/models/all.ts');
				var importStatement = 'import ' + this.modelName + ' = require(\'./' + this.modelName + '\'); ' + this.modelName + ';';
				if (all.indexOf(importStatement) === -1) {
					// Add the unit test to the tests imported
					// TODO: can this be done better?
					var result = all.trim() ? all : '';
					result += (!result || /[\n]$/.test(all) ? '' : '\n') + importStatement + '\n';
					this.dest.write('src/app/tests/unit/models/all.ts', result);
				}
			}
		}
	},

	end: {
	}
});

export = ModelGenerator;
