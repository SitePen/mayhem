import BaseTemplate = require('./Template');
import parser = require('./html/peg/html');

class Template extends BaseTemplate {
}

Template.prototype.parser = parser;

export = Template;
