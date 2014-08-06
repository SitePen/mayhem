import lang = require('dojo/_base/lang');
import parser = require('./html/peg/html');
import templating = require('./interfaces');
import util = require('../util');
import Widget = require('../ui/dom/Widget');

interface WidgetConstructor {
	new (kwArgs?:HashMap<any>):Widget;
}

function instantiate(Ctor:WidgetConstructor, kwArgs:HashMap<any>):Widget;
function instantiate(Ctor:string, kwArgs:HashMap<any>):Widget;
function instantiate(Ctor:any, kwArgs:HashMap<any>):Widget {
	Ctor = typeof Ctor === 'string' ?
		<WidgetConstructor> require(<string> <any> Ctor) :
		<WidgetConstructor> Ctor;

	return new Ctor(kwArgs);
}

function createViewConstructor(root:templating.INode):WidgetConstructor {
	return <any> function (kwArgs?:HashMap<any>):Widget {
		var staticArgs:HashMap<any> = (function visit(node:templating.INode, parent?:templating.INode):any {
			if (typeof node !== 'object') {
				return node;
			}

			var value:HashMap<any> = node instanceof Array ? [] : {};

			for (var key in node) {
				if (key === 'constructor') {
					continue;
				}

				value[key] = visit(node[key], node);
			}

			// If there is no parent, this is the root node, which will get constructed separately since it receives the
			// keywords arguments from the constructor call; otherwise, if the value of `node.constructor` is not the
			// Object or Array constructors, this node is a typed object instance that needs to be converted into a
			// typed object
			if (node.constructor && <any> node.constructor !== value.constructor && parent) {
				// If the parent object is a special constructor token object, then this node should actually be
				// converted into a constructor, not an instance
				if (parent.$ctor) {
					value = (function (staticArgs:HashMap<any>):WidgetConstructor {
						return <any> function (kwArgs?:HashMap<any>) {
							return instantiate(node.constructor, lang.mixin({}, staticArgs, kwArgs));
						};
					})(value);
				}
				else {
					value['app'] = kwArgs['app'];
					value = instantiate(node.constructor, value);
				}
			}

			return value;
		})(root);

		return instantiate(root.constructor, lang.mixin(staticArgs, kwArgs));
	};
}

export function load(resourceId:string, require:typeof require, load:(value:typeof Widget) => void):void {
	util.getModule('dojo/text!' + resourceId).then(function (template:string):void {
		var ast:templating.IParseTree = parser.parse(template);
		util.getModules(ast.constructors).then(function ():void {
			load(createViewConstructor(ast.root));
		});
	});
}
