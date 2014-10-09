'use strict';
var yeoman = require('yeoman-generator');
var BuildSubGenerator = yeoman.generators.Base.extend({

    initializing: function () {
        this.log('Build sub generator');
    }
});

module.exports = BuildSubGenerator;
