import BaseTemplate = require('./Template');
import templating = require('./interfaces');

class Template extends BaseTemplate {
}

Template.prototype.parser = {
	parse(source:string):templating.IParseTree {
		return JSON.parse(source);
	}
}

export = Template;
