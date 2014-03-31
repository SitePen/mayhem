import BaseTemplate = require('./Template');
import templating = require('./interfaces');

class Template extends BaseTemplate {
	static normalize(resourceId:string, normalize:(id:string) => string):string {
		// Add json extension if not present
		var parts = resourceId.split('/'),
			last = parts.length - 1;
		parts[last] = parts[last].replace(/^([^.]+)$/, '$1.json');
		return normalize(parts.join('/'));
	}
}

Template.prototype.parser = {
	parse(source:string):templating.IParseTree {
		return JSON.parse(source);
	}
}

export = Template;