'use strict';
var yeoman = require('yeoman-generator');
var ModelSubGenerator = yeoman.generators.Base.extend({

    initializing: function () {
        this.log('Model sub generator');
    }
});

module.exports = ModelSubGenerator;
