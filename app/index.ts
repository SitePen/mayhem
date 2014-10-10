declare var module:any;
declare var process:any;
declare var require:any;

var appChoices:string[] = ['webapp'];
var exec:any = require('child_process').exec;
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
        }
    },

    configuring():void {
        if (this.source) {
            this.destinationRoot(this.source);
        }

        var source = this.source ? this.source : 'root directory';

        this.log('Creating a ' + this.type + ' in ' + source);
        this.src.copy('_package.json', 'package.json');
        this.src.copy('_tslint.json', 'tslint.json');
        this.src.copy('jshintrc', '.jshintrc');
    },

    install: {
        installMayhem():void {
            var self = this;
            var done = this.async();
            this.npmInstall(['SitePen/mayhem'], { 'saveDev': true }, ():void => {
                var nodeModules = path.join(process.cwd(), '/node_modules/mayhem');
                process.chdir(nodeModules);
                self.log('Installing node modules for Mayhem');
                exec('npm install', (error:any, stdout:any):void => {
                    self.log(stdout);
                    done();
                });
            });
        }
    },

    end():void {
        this.log('All done.  Thank you for using the Mayhem generator!');
    }
});

module.exports = MayhemGenerator;
