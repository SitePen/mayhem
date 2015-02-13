/**
 * The HTML templating engine loader.
 *
 * @module mayhem/templating/html
 */

import Application = require('../Application');
import arrayUtil = require('dojo/_base/array');
import aspect = require('dojo/aspect');
import BindDirection = require('../binding/BindDirection');
import binding = require('../binding/interfaces');
import lang = require('dojo/_base/lang');
import parser = require('./html/peg/html');
import templating = require('./interfaces');
import util = require('../util');
import Widget = require('../ui/dom/Widget');

// TODO: This function typically comes from TypeScript itself so is available everywhere, but its use here is a hack.
declare function __extends(d:typeof Widget, b:typeof Widget):typeof Widget;

interface BindingDeclaration {
	$bind:string;
	direction:BindDirection;
}

/**
 * Creates a BindableWidget constructor from a template AST node.
 *
 * @param root The AST node to use as the root node for the constructed widget.
 * @returns A constructor that instantiates a composed view tree based on the contents of the AST.
 */
function createViewConstructor(root:templating.INode):typeof Widget {
	var BaseCtor = require<typeof Widget>(root.constructor);

	/**
	 * @constructor
	 */
	function TemplatedView(kwArgs:HashMap<any> = {}) {
		var app:Application = kwArgs['app'] || this.get('app');

		if (!app) {
			throw new Error(
				'An instance of Application must be provided to templated views, either inherited from the parent ' +
				'prototype or passed on the "app" key to the constructor'
			);
		}

		var model:{} = kwArgs['model'] || this.get('model') || {};
		var binder = app.get('binder');

		var handles:binding.IBindingHandle[] = [];

		function applyBindings(widget:Widget, bindings:HashMap<BindingDeclaration>) {
			for (var key in bindings) {
				var declaration = bindings[key];
				handles.push(binder.bind({
					source: model,
					sourcePath: declaration.$bind,
					target: widget,
					targetPath: key,
					direction: declaration.direction
				}));
			}
		}

		function getInitialStateFromNode(node:templating.INode) {
			var kwArgs:HashMap<any> = { app };
			var bindings:HashMap<BindingDeclaration> = {};

			for (var key in node) {
				if (key === 'constructor') {
					continue;
				}

				var value:any = node[key];

				// property is a binding
				if (value && value.$bind) {
					bindings[key] = value;
				}
				// property is a constructor
				else if (value && value.$ctor) {
					kwArgs[key] = createViewConstructor(value.$ctor);
				}
				// property is a widget instance
				else if (value && typeof value.constructor === 'string') {
					kwArgs[key] = initializeChild(value);
				}
				// property is a static value
				else {
					kwArgs[key] = value;
				}
			}

			return {
				kwArgs,
				bindings
			};
		}

		function initializeChild(node:templating.INode) {
			var WidgetCtor = require<typeof Widget>(node.constructor);
			var initialState = getInitialStateFromNode(node);

			var childWidget = new WidgetCtor(initialState.kwArgs);
			applyBindings(childWidget, initialState.bindings);

			return childWidget;
		}

		// TODO: Prevents children from being removed and adopted elsewhere; need to have widgets emit remove events
		// so that we can reparent them
		aspect.before(this, 'destroy', function () {
			var handle:IHandle;
			while ((handle = handles.pop())) {
				handle.remove();
			}
		});

		var model:{};
		if (!('_modelGetter' in this)) {
			this._modelGetter = function () {
				return model;
			};
		}
		if (!('_modelSetter' in this)) {
			this._modelSetter = function (_model:{}) {
				model = _model;
			};
		}

		aspect.after(this, '_modelSetter', function (value:{}) {
			for (var i = 0, handle:binding.IBindingHandle; (handle = handles[i]); ++i) {
				handle.setSource(value || {});
			}
		}, true);

		var initialState = getInitialStateFromNode(root);
		applyBindings(this, initialState.bindings);
		BaseCtor.call(this, lang.mixin(initialState.kwArgs, kwArgs));
	}

	__extends(<any> TemplatedView, BaseCtor);

	return <any> TemplatedView;
}

/**
 * Creates a Widget constructor from an HTML template.
 *
 * @param template A Mayhem HTML template.
 * @returns A promise that resolves to an BindableWidget constructor.
 */
export function create(template:string):IPromise<typeof Widget> {
	var ast:templating.IParseTree = parser.parse(template);
	return util.getModules(ast.constructors).then(function ():typeof Widget {
		return createViewConstructor(ast.root);
	});
}

export function createFromFile(filename:string):IPromise<typeof Widget> {
	return util.getModule('dojo/text!' + filename).then(function (template:string):IPromise<typeof Widget> {
		return create(template);
	});
}

/**
 * Implementation of the AMD Loader Plugin API.
 *
 * @param resourceId The path to the template.
 * @param require Context-specific require.
 * @param load Callback function passed a templated widget constructor.
 */
export function load(resourceId:string, _:typeof require, load:(value:typeof Widget) => void):void {
	createFromFile(resourceId).then(load);
}

export function normalize(resourceId:string, normalize:(id:string) => string):string {
	if (!/\.html(?:$|\?)/.test(resourceId)) {
		return normalize(resourceId.replace(/(\?|$)/, '.html$1'));
	}

	return normalize(resourceId);
}
