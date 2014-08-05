import lang = require('dojo/_base/lang');
import parser = require('./html/peg/html');
import templating = require('./interfaces');
import util = require('../util');
import Widget = require('../ui/dom/Widget');

export function load(resourceId:string, require:typeof require, load:(value:typeof Widget) => void):void {
	util.getModule('dojo/text!' + resourceId).then(function (template:string):void {
		var ast:templating.IParseTree = parser.parse(template);
		util.getModules(ast.constructors).then(function ():void {
			load(<any> function (kwArgs?:HashMap<any>):Widget {
				var Ctor:typeof Widget = require(ast.root.constructor);

				kwArgs = lang.mixin({}, <any> ast.root, kwArgs);
				return new Ctor(kwArgs);
			});
		});
	});
}
