import dojoText = require('dojo/text');
import pegParser = require('./html/peg/html');
import Processor = require('./Processor');
import templating = require('./interfaces');

export function load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void {
	dojoText.load(resourceId, contextRequire, function(template:string):void {
		Processor.processTemplate(template, parser).then(load);
	});
}

export var parser:templating.IParser = pegParser;
