import dojoText = require('dojo/text');
import pegParser = require('./html/peg/html');
import processor = require('./processor');
import templating = require('./interfaces');

export function load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void {
	dojoText.load(resourceId, contextRequire, function(template:string):void {
		processor.processTemplate(template, parser).then(load);
	});
}

export var parser:templating.IParser = pegParser;
