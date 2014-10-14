declare var module:any;
declare var process:any;
declare var require:any;

var appChoices:string[] = ['webapp'];
var path:any = require('path');
var yeoman:any = require('yeoman-generator');

var MayhemGenerator = yeoman.generators.Base.extend({

	constructor():void {
		yeoman.generators.Base.apply(this, arguments);
		this.argument('type', { required: false });
		this.argument('source', { required: false });
	},

	initializing():void {
		this.log('Welcome to the Mayhem Generator!');
	},

	prompting: {
		method1():void {
			if (appChoices.indexOf(this.type) === -1) {
				var self = this;
				var done = this.async();
				var choices = [{
					type: 'list',
					name: 'apps',
					message: 'Which kind of application are we making today?',
					'default': 'index',
					choices: ['Web']
				}];

				this.prompt(choices, (args:{ apps: string }):void => {
					var type = args.apps.toLowerCase();
					self.type = type + 'app';
					done();
				});
			}
		},
		method2():void {
			var self = this;
			var done = this.async();
			var choices = [{
				type: 'confirm',
				name: 'todo',
				message: 'Would you like an example Todo app created as a starting point?',
				'default': false
			}];

			this.prompt(choices, (args:{ todo: boolean }):void => {
				self.todo = args.todo;
				done();
			});
		}
	},

	configuring():void {
		if (this.source) {
			this.destinationRoot(this.source);
		}

		var source = this.source ? this.source : 'root directory';
		this.log('Creating a ' + this.type + ' in ' + source);
		this.copy('_tslint.json', 'tslint.json');
		this.copy('_jshintrc', '.jshintrc');

		if (this.todo) {
			this.mkdir('models');
			this.mkdir('viewModels');
			this.mkdir('views');
			this.copy('_package.json', 'package.json');
			this.copy('_Gruntfile.js', 'Gruntfile.js');
			this.copy('models/Todo.ts', 'models/Todo.ts');
			this.copy('viewModels/index.ts', 'viewModels/index.ts');
			this.copy('views/Application.html', 'views/Application.html');
			this.copy('views/index.html', 'views/index.html');
		}
	},

	install():void {
		var self = this;
		var done = this.async();
		this.npmInstall('', ():void => {
			var nodeModules = path.join(process.cwd(), '/node_modules/mayhem');
			process.chdir(nodeModules);
			self.npmInstall('', ():void => {
	        	done();
        	});
    	});
	},

	end():void {
		this.log('All done!  Thank you for using the Mayhem generator!');
	}
});

module.exports = MayhemGenerator;
