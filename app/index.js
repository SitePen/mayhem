/*global module,process*/
var exec = require('child_process').exec;
var path = require('path');
var yeoman = require('yeoman-generator');
var appChoices = ['webapp'];
var MayhemGenerator = yeoman.generators.Base.extend({

    constructor: function () {
        yeoman.generators.Base.apply(this, arguments);
        this.argument('type', { required: false });
        this.argument('source', { required: false });
    },

    initializing: function () {
        this.log('Welcome to the Mayhem Generator!');
    },

    prompting: {
        method1: function () {
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

                this.prompt(choices, function (args) {
                    var type = args.apps.toLowerCase();
                    self.type = type + 'app';
                    done();
                });
            }
        }
    },

    configuring: function () {
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
        installMayhem: function () {
            var self = this;
            var done = this.async();
            this.npmInstall(['SitePen/mayhem'], { 'saveDev': true }, function () {
                var nodeModules = path.join(process.cwd(), '/node_modules/mayhem');
                process.chdir(nodeModules);
                self.log('Installing node modules for Mayhem');
                exec('npm install', function (error, stdout) {
                    self.log(stdout);
                    done();
                });
            });
        }
    },

    end: function () {
        this.log('All done.  Thank you for using the Mayhem generator!');
    }
});

module.exports = MayhemGenerator;
