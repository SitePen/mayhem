import BaseTemplate = require('./Template');
import parser = require('./html/peg/html');

class Template extends BaseTemplate {
	static normalize(resourceId:string, normalize:(id:string) => string):string {
		// Add html extension if not present
		var parts = resourceId.split('/'),
			last = parts.length - 1;
		parts[last] = parts[last].replace(/^([^.]+)$/, '$1.html');
		return normalize(parts.join('/'));
	}
}

Template.prototype.parser = parser;

export = Template;
