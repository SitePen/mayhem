import dojoText = require('dojo/text');
export import Template = require('./html/Template');
import templating = require('./interfaces');

export function load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void {
	dojoText.load(resourceId, contextRequire, function(input:string):void {
		process(input).load().then(load);
	});
}

export function parse(source:string):templating.IParseTree {
	return process(source).tree;
}

export function process(source:string):Template {
	return new Template(source);
}
