declare var module:any;
declare var require:any;

var yeoman:any = require('yeoman-generator');

var BuildSubGenerator = yeoman.generators.Base.extend({
    initializing():void {
        this.log('Build sub generator');
    }
});

module.exports = BuildSubGenerator;
