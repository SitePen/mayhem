/// <reference path="../node" />
/// <reference path="../yeoman-generator" />

import ImportsFile = require('../common/ImportsFile');
import yeoman = require('yeoman-generator');

var ModelGenerator = yeoman.generators.NamedBase.extend({
	constructor():void {
		yeoman.generators.NamedBase.apply(this, arguments);

		this.modelName = this._.camelize('-' + this.name + '-model');
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

				var allTests = new ImportsFile('src/app/tests/unit/all.ts', this.dest);
				if (!allTests.containsImport('models', './models/all')) {
					allTests.addImport('models', './models/all');
					allTests.write();
				}

				var all = new ImportsFile('src/app/tests/unit/models/all.ts', this.dest);
				if (!all.containsImport(this.modelName, './' + this.modelName)) {
					all.addImport(this.modelName, './' + this.modelName);
					all.write();
				}
			}
		}
	},

	end: {
	}
});

export = ModelGenerator;
