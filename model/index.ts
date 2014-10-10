declare var module:any;
declare var require:any;

var yeoman:any = require('yeoman-generator');

var ModelSubGenerator = yeoman.generators.Base.extend({
    initializing():void {
        this.log('Model sub generator');
    }
});

module.exports = ModelSubGenerator;
