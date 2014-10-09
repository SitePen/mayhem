'use strict';
var yeoman = require('yeoman-generator');
var RouterSubGenerator = yeoman.generators.Base.extend({

    initializing: function () {
        this.log('Router sub generator');
    }
});

module.exports = RouterSubGenerator;
