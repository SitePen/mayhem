/// <reference path="./peg/html.d.ts" />

import parser = require('framework/templating/peg/html'); // TODO: is this the Right Way?
import core = require('../interfaces');;
import Proxty = require('../Proxty');
import widgets = require('../ui/interfaces');
import Widget = require('../ui/Widget');
import util = require('../util');
import array = require('dojo/_base/array');


class Parser {

	static parse(input:string):any {
		return parser.parse(input);
	}

	static scanForDependencies(node:any) {
		var dependencies:string[] = [];
		// TODO: should we bother with cycle detection?
		function recurse(node:any) {
			if (!util.isObject(node)) return;
			if (node.constructor) {
				// collect up our dependencies from ctor references
				var ctor = node.constructor;
				// flatten constructor if it's array like
				if (ctor && typeof ctor.join === 'function') {
					ctor = ctor.join('');
				}
				// add to list of dependencies if string module id
				typeof ctor === 'string' && dependencies.indexOf(ctor) < 0 && dependencies.push(ctor);
			}

			array.forEach(util.getObjectKeys(node), (key) => {
				var value = node[key];
				if (util.isObject(value)) {
					recurse(value);
				}
				else if (Array.isArray(value)) { // FIXME es5
					array.forEach(value, recurse);
				}
			});

			var children = node.children;
			if (!children || !children.length) {
				return;
			}
			for (var i = 0, length = children.length; i < length; ++i) {
				recurse(children[i]);
			}
		}
		recurse(node);
		return dependencies;
	}

	app:core.IApplication;
	mediator:core.IMediator;
	input:string;
	ast:any;
	dependencyCache:any = {};

	constructor(kwArgs:any) {
		this.app = kwArgs.app;
		this.mediator = kwArgs.mediator;
	}

	process(input:string):IPromise<widgets.IWidget> {
		var ast = Parser.parse(input);
		var dependencies = Parser.scanForDependencies(ast);

		return Widget.fetch(dependencies).then((dependencyCache) => {
			this.dependencyCache = dependencyCache; // TODO: meh
			return this.constructWidget(ast);
		});
	}

	private _getBindingString(parts:any[], bindingMap:any):string {
		return array.map(parts, (part:any /*String | Object*/) => {
			if (part.binding) {
				return bindingMap[part.binding].get();
			}
			return part;
		}).join('');
	}

	private _getProxty(parts:any[], bindingMap:any):core.IProxty<string> {
		var value = this._getBindingString(parts, bindingMap);
		// TODO: should we enable coercion of some sort here?
		var proxty = new Proxty<string>(value);
		array.forEach(util.getObjectKeys(bindingMap), (key:string) => {
			// TODO: drip drip
			bindingMap[key].observe(() => {
				proxty.set(this._getBindingString(parts, bindingMap));
			}, false);
		});
		return proxty;
	}

	// TODO node:IAstNode?
	constructWidget(node:any, parent?:widgets.IWidget):widgets.IWidget {
		var options:any = {},
			children:any,
			html:any;

		// We handle html and children special after widget insantiation
		if (node.children) {
			children = node.children;
			node.children = undefined;
		}
		if (node.html) {
			var html = node.html;
			node.html = undefined;
		}
		var ctor:any = node.constructor;
		node.constructor = undefined;
		if (Array.isArray(ctor)) ctor = ctor.join(''); // FIXME es5
		// if ctor isn't already a constructor look up ctor from the dependency map
		var WidgetCtor = typeof ctor === 'string' ? this.dependencyCache[ctor] : ctor;
		var widget:any /* widgets.IDomWidget */,
			fieldBindings:{ [key:string]: string; } = {},
			proxtyBindings:{ [key:string]: core.IProxty<string>; } = {};

		array.forEach(util.getObjectKeys(node), (key:string) => {
			if (node[key] === undefined) return;
			var parts = node[key];
			var values:string[] = [];
			// TODO: way too many assumptions -- this needs to be a lot cleaner
			if (parts.length === 1) {
				if (parts[0] && parts[0].binding) {
					fieldBindings[key] = parts[0].binding;
				}
				else {
					options[key] = parts[0];
				}
			}
			else {
				// if value array is more than 1 item it should have bindings and get a proxty
				var bindingMap:any;
				array.forEach(parts, (part:any) => {
					if (part.binding) {
						bindingMap || (bindingMap = {});
						var binding:string = part.binding;
						bindingMap[binding] = this.mediator.model[binding];
					}
				});
				if (bindingMap) {
					// if bindings create a proxty for all bindings
					proxtyBindings[key] = this._getProxty(parts, bindingMap);
				}
				else {
					// no bindings, so just pass through
					options[key] = parts;
				}
			}
		});

		options.parser = this;
		options.app = this.app;
		if (parent) {
			options.parent = parent;
			// TODO: annoying -- this is still necessary for some reason
			options.mediator = this.mediator;
		}
		else {
			options.mediator = this.mediator;
		}
		widget = new WidgetCtor(options);

		if (html) widget.set('html', html);
		if (children) {
			widget.set('children', array.map(children, (child) => this.constructWidget(child, widget)));
		}

		// set up widget bindings after construction
		for (var key in fieldBindings) {
			widget.bind(key, fieldBindings[key], { direction: 2 });
		}
		// set up unidirectional bindings
		var proxty:core.IProxty<string>;
		for (var key in proxtyBindings) {
			proxty = proxtyBindings[key];
			// TODO: how are we supposed to set up a bind for a proxty?
			//widget.bind(proxty, key, { direction: 1 });
			// TODO: in lieu of binding...drip drip...
			proxty.observe((newValue:string) => widget.set(key, newValue));
		}
		return widget;
	}
}

export = Parser;
