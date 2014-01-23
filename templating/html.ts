/// <reference path="./peg/html.d.ts" />

import parser = require('framework/templating/peg/html'); // FIXME
import Element = require('../ui/dom/Element');
import core = require('../interfaces');
import Deferred = require('dojo/Deferred');

function process(input:string, app:core.IApplication, mediator:core.IMediator) {
	var ast = parser.parse(input);
	var dfd:IDeferred<Element> = new Deferred<Element>();
	var el = new Element({
		app: app,
		mediator: mediator
	});

	// ignore bindings in html for now
	el.set('html', ast.html.join(''));

	// collect up our deps from ctor references
	// TODO is it possible for ASTs to contain constructor references in addition to module ids?
	var deps:string[] = [];
	function depWalk(node:any) { // TODO IAstNode
		// Assume constructor exists and is a 1-element array
		var ctor = node.constructor[0];
		deps.indexOf(ctor) < 0 && deps.push(ctor);
		var children = node.children;
		if (!children || !children.length) {
			return;
		}
		for (var i = 0, length = children.length; i < length; ++i) {
			depWalk(children[i]);
		}
	}
	ast.children.forEach(depWalk); // FIXME es5

	// TODO what's the correct way to load?
	var remappedDeps = deps.map((d) => 'framework/ui/dom/' + d); // FIXME es5
	require(remappedDeps, function() {
		// map our deps
		var depMap = {};
		for (var i = 0, length = deps.length; i < length; ++i) {
			depMap[deps[i]] = arguments[i];
		}

		// FIXME this is a hacky top level iteration
		var child:any,
			i:number = 0,
			length:number = ast.children.length;
		for (; i < length; ++i) {
			child = ast.children[i];
			// assume child.constructor is a 1-element array w/ ctor module id
			// get the ctor module from the dep map
			var Ctor = depMap[child.constructor[0]];
			
			var options:any = {
				app: app,
				mediator: mediator
			};
			if (child.binding) options.binding = child.binding[0]; // FIXME
			var childEl = new Ctor(options);

			var ignoreKeys = [ 'constructor', 'children', 'binding' ];
			Object.keys(child).filter((k) => ignoreKeys.indexOf(k) < 0).forEach(function(key) { // FIXME es5
				if (ignoreKeys.indexOf(key) >= 0) return;
				var values = child[key];
				var parts:string[] = [];
				// this should be a lot cleaner, but i don't know enough about bindings to make it so
				if (values.length === 1) {
					child.bind(key, values[0], { direction: 2 });
				}
				else {
					values.forEach(function(part:any) { // FIXME es5
						if (part && part.binding) {
							// FIXME what's the right way to do this? I thought mediator had a getProxty now?
							var proxty = mediator.model[part.binding];
							// TODO proxty binder?
							parts.push(proxty.get());
						}
						else {
							parts.push(part);
						}
					});
				}
				// FIXME is this how we're supposed to be setting bindings?
				childEl.set(key, parts.join(''));
			});
			// TODO bindings

			el._fillPlaceholder(i, childEl);
		}
		dfd.resolve(el);
		// TODO where to dfd.reject in amd require?
	});

	return dfd.promise;
}

export = process;
