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
	var dfd:IDeferred<Element> = new Deferred<Element>(); // should be widgets.IDomWidget

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

		function getBindingString(parts:any[], bindingMap:any):string {
			return array.map(parts, function(part:any /*String | Object*/) {
				if (part.binding) {
					return bindingMap[part.binding].get();
				}
				return part;
			}).join('');
		}

		function getProxty(parts:any[], bindingMap:any):core.IProxty<string> {
			var value = getBindingString(parts, bindingMap);
			// TODO: should we enable coercion of some sort here?
			var proxty = new Proxty<string>(value);
			array.forEach(util.getObjectKeys(bindingMap), function(key:string) {
				// TODO: drip drip
				bindingMap[key].observe(function() {
					proxty.set(getBindingString(parts, bindingMap));
				}, false);
			});
			return proxty;
		}

		function processNode(node:any):any /* widgets.IDomWidget */ {
			var options:any = {},
				ignoreKeys:string[] = [ 'children', 'html' ];
			// walk children and process recursively
			if (node.children) {
				options.children = array.map(node.children, processNode);
			}
			// preserve html as is
			if (node.html) {
				options.html = node.html;
			}
			var ctor:any = node.constructor;
			// if node.constructor is a string get the ctor module from dependency map
			var WidgetCtor = typeof ctor === 'string' ? depMap[ctor] : ctor;
			var widget:any /* widgets.IDomWidget */,
				fieldBindings:{ [key:string]: string; } = {},
				proxtyBindings:{ [key:string]: core.IProxty<string>; } = {};

			array.forEach(util.getObjectKeys(node), function(key:string) {
				if (key === 'constructor') return;
				if (key === 'binding') return; // TODO remove
				if (ignoreKeys.indexOf(key) >= 0) {
					return;
				}
				var parts = node[key];
				var values:string[] = [];
				// TODO: this could probably be a lot cleaner
				if (parts.length === 1) {
					if (parts[0].binding) {
						fieldBindings[key] = parts[0].binding;
					}
					else {
						options[key] = parts[0];
					}
				}
				else {
					// if value array is more than 1 item it should have bindings and get a proxty
					var bindingMap:any = {};
					array.forEach(parts, function(part:any) {
						if (part.binding) {
							var field:string = part.binding;
							bindingMap[field] = mediator.model[field];
						}
					});
					proxtyBindings[key] = getProxty(parts, bindingMap);
				}
			});
			// TOOD: this setContent bs stinks, but we need to set html and children simultaneously
			//widget.setContent && widget.setContent(children, node.html);
			options.app = app;
			options.mediator = mediator;
			widget = new WidgetCtor(options);
			// set up widget bindings after construction
			for (var key in fieldBindings) {
				// TODO: Y U NO WORK BIDIRECTIONALLY?!!
				widget.bind(key, fieldBindings[key], { direction: 2 });
			}
			// set up unidirectional bindings
			var proxty:core.IProxty<string>;
			for (var key in proxtyBindings) {
				proxty = proxtyBindings[key];
				// TODO: how are we supposed to set up a bind for a proxty?
				//widget.bind(proxty, key, { direction: 1 });
				// TODO: in lieu of binding...drip drip...
				proxty.observe(function(newValue:string) {
					widget.set(key, newValue);
				});
			}
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
