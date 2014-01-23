/// <reference path="./peg/html.d.ts" />

import parser = require('framework/templating/peg/html'); // TODO: is this the Right Way?
import core = require('../interfaces');;
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

			// TODO: is this the complete list of reserved keys?
			// TODO: could we get the parser to put attributes in a separate namespace?
			var reservedKeys = [ 'constructor', 'children', 'html', 'binding' ];
			var attributes = array.filter(util.getObjectKeys(node), (k) => reservedKeys.indexOf(k) < 0);
			array.forEach(attributes, function(key) {
				var values = node[key];
				var parts:string[] = [];
				// TODO: this should be a lot cleaner, but i don't know enough about bindings to make it so
				if (values.length === 1) {
					debugger
					widget.bind(key, values[0].binding, { direction: 2 });
				}
				else {
					values.forEach(function(part:any) { // FIXME es5
						if (part && part.binding) {
							// TODO: what's the right way to do this? I thought mediator had a getProxty now?
							var proxty = mediator.model[part.binding];
							// TODO: proxty binder?
							parts.push(proxty.get());
						}
						else {
							parts.push(part);
						}
					});
				}
				// TODO: is this what we're supposed to do with attributes?
				widget.set(key, parts.join(''));
			});
			widget.setContents && widget.setContents(node.html, children);
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
