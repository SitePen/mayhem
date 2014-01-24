/// <reference path="./peg/html.d.ts" />

import parser = require('framework/templating/peg/html'); // TODO: is this the Right Way?
import core = require('../interfaces');;
import Proxty = require('../Proxty');
import widgets = require('../ui/interfaces');
import Element = require('../ui/dom/Element') // TODO: remove
import util = require('../util');
import array = require('dojo/_base/array');
import Deferred = require('dojo/Deferred');


// TODO: export
function parse(input:string) {
	return parser.parse(input);
}

function process(input:string, app:core.IApplication, mediator:core.IMediator) {
	var ast = parser.parse(input);
	console.log(ast);
	var dfd:IDeferred<Element> = new Deferred<Element>();

	// collect up our deps from ctor references
	var deps:string[] = [];
	function depWalk(node:any) { // TODO IAstNode?
		var ctor = node.constructor;
		// flatten constructor if it's array like
		if (ctor && typeof ctor.join === 'function') {
			node.constructor = ctor = ctor.join('');
		}
		// add to list of deps if string module id
		typeof ctor === 'string' && deps.indexOf(ctor) < 0 && deps.push(ctor);
		var children = node.children;
		if (!children || !children.length) {
			return;
		}
		for (var i = 0, length = children.length; i < length; ++i) {
			depWalk(children[i]);
		}
	}
	depWalk(ast);

	// TODO: what's the correct way to load deps?
	require(deps, function() {
		// map our resolved dependencies to their module ids
		var depMap:any = {};
		for (var i = 0, length = deps.length; i < length; ++i) {
			depMap[deps[i]] = arguments[i];
		}

		function processNode(node:any) {
			var widget:any, // TODO: widgets.IDomWidget
				children:widgets.IDomWidget[],
				i:number = 0,
				length:number = ast.children.length;
			// Walk children and process recursively
			if (node.children) {
				children = array.map(node.children, processNode);
			}
			var options:any = {
				app: app,
				mediator: mediator
			};
			// TODO: this is almost certainly not right
			if (node.binding) options.binding = node.binding.join('');

			var ctor:any = node.constructor;
			// if node.constructor is a string get the ctor module from dependency map
			var WidgetCtor = typeof ctor === 'string' ? depMap[ctor] : ctor;
			widget = new WidgetCtor(options);
			// void out node's constructor
			// TODO node.constructor = undefined;

			var reservedKeys = [ 'constructor', 'children', 'html', 'binding' ];

			function processBindings(parts:any[], bindings:any):string {
				return array.map(parts, function(part:any /*String | Object*/) {
					if (part.binding) {
						return bindings[part.binding].get();
					}
					return part;
				}).join('');
			}
			function getProxty(parts:any[], bindings:any):core.IProxty<string> {
				var value = processBindings(parts, bindings);
				// TODO: should we enable coercion of some sort here?
				var proxty = new Proxty<string>(value);
				array.forEach(util.getObjectKeys(bindings), function(key:string) {
					// TODO: drip drip
					bindings[key].observe(function() {
						proxty.set(processBindings(parts, bindings));
					}, false);
				});
				return proxty;
			}

			var attributes = array.filter(util.getObjectKeys(node), (k:string) => reservedKeys.indexOf(k) < 0);
			array.forEach(attributes, function(key) {
				var parts = node[key];
				var values:string[] = [];
				// TODO: this should be a lot cleaner, but i don't know enough about bindings to make it so
				if (parts.length === 1 && parts[0] && parts[0].binding) {
					// TODO: Y U NO WORK BIDIRECTIONALLY?!!
					widget.bind(key, parts[0].binding, { direction: 2 });
					// TODO: void out key and do this bind after widget construction
				}
				else {
					var bindings:any;
					array.forEach(parts, function(part:any) {
						if (part.binding) {
							bindings || (bindings = {});
							var field:string = part.binding;
							bindings[field] = mediator.model[field];
						}
					});
					if (bindings) {
						// TODO: Y U NO WUT?
						var proxty = getProxty(parts, bindings);
						//widget.bind(proxty, key, { direction: 1 });
						proxty.observe(function(newValue:string) {
							widget.set(key, newValue);
						});
					}
					else {
						// TODO: set on ctor options instead and construct later
						widget.set(key, parts.join(''));
					}
				}
			});
			widget.setContent && widget.setContent(children, node.html);
			return widget;
		}
		try {
			dfd.resolve(processNode(ast));
		}
		catch (error) {
			dfd.reject(error);
		}
		// TODO: where to catch for dfd.reject in amd require?
	});

	return dfd.promise;
}

export = process;
