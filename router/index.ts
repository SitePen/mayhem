declare var module:any;
declare var require:any;

var yeoman:any = require('yeoman-generator');

var RouterSubGenerator = yeoman.generators.Base.extend({
    initializing():void {
        this.log('Router sub generator');
    }
});

module.exports = RouterSubGenerator;
