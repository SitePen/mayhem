import Template = require('../Template');
import parser = require('./peg/html');
import templating = require('../interfaces');

class HtmlTemplate extends Template {
	parse():templating.IParseTree {
		return parser.parse(this.source);
	}
}

export = HtmlTemplate;
