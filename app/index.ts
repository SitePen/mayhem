/// <reference path="../node" />
/// <reference path="../yeoman-generator" />

import path = require('path');
import yeoman = require('yeoman-generator');

interface IAnswers {
	appTitle:string;
	nib:boolean;
	oldBrowsers:boolean;
	stylus:boolean;
}

var MayhemGenerator = yeoman.generators.Base.extend({
	constructor():void {
		yeoman.generators.Base.apply(this, arguments);

		this.argument('appName', { type: String, required: false });
		this.appName = this.appName || path.basename(process.cwd());
		this.appName = this._.slugify(this._.humanize(this.appName));

		this.config.defaults({
			appName: this.appName,
			appTitle: this.appName,
			oldBrowsers: false,
			stylus: true,
			nib: true
		});
	},

	initializing():void {
		this.log('Welcome to the Mayhem Generator!');
	},

	prompting():void {
		var done:Function = this.async();

		this.prompt([
			{
				type: 'input',
				name: 'appTitle',
				message: 'What is the title of the application?',
				default: this.config.get('appTitle')
			},
			{
				type: 'confirm',
				name: 'oldBrowsers',
				message: 'Do you need to support older browsers (ES3)?',
				default: this.config.get('oldBrowsers')
			},
			{
				type: 'confirm',
				name: 'stylus',
				message: 'Would you like to use Stylus?',
				default: this.config.get('stylus')
			},
			{
				type: 'confirm',
				name: 'nib',
				message: 'Would you like to use Sylus Nib?',
				when: function (answers:IAnswers):boolean {
					return answers.stylus;
				},
				default: this.config.get('nib')
			}
		], function (answers:IAnswers):void {
			this.appTitle = answers.appTitle;
			this.stylus = answers.stylus;
			this.nib = answers.nib;
			this.oldBrowsers = answers.oldBrowsers;

			this.config.set(answers);

			done();
		}.bind(this));
	},

	configuring():void {
		this.copy('_bowerrc', '.bowerrc');
		this.copy('_bower.json', 'bower.json');
		this.copy('_gitignore', '.gitignore');
		this.copy('_Gruntfile.js', 'Gruntfile.js');
		this.copy('_jshintrc', '.jshintrc');
		this.copy('_package.json', 'package.json');
		this.copy('_tslint.json', 'tslint.json');
	},

	writing: {
		index():void {
			this.copy('src/_index.html', 'src/index.html');
		},
		css():void {
			if (this.stylus) {
				this.copy('src/app/resources/_main.styl', 'src/app/resources/main.styl');
			}
			else {
				this.copy('src/app/resources/main.css', 'src/app/resources/main.css');
			}
		},
		app():void {
			this.copy('src/app/_main.ts', 'src/app/main.ts');
			this.directory('src/app/viewModels', 'src/app/viewModels');
			this.directory('src/app/views', 'src/app/views');
		}
	},

	install():void {
		this.installDependencies({
			skipInstall: this.options['skip-install']
		});
	},

	end():void {
		this.log('All done! Thank you for using the Mayhem generator!');
	}
});

export = MayhemGenerator;
