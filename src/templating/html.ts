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
import ui = require('../ui/interfaces');
import util = require('../util');
import Widget = require('../ui/dom/Widget');

// TODO: This function typically comes from TypeScript itself so is available everywhere, but its use here is a hack.
declare function __extends(d:typeof Widget, b:typeof Widget):typeof Widget;

interface BindingDeclaration {
	$bind:string;
	direction:BindDirection;
}

export interface TemplatingAwareWidgetConstructor {
	inheritsModel?:boolean;
	new (kwArgs?:{}):Widget;
	prototype:Widget;
}

interface InstanceArguments {
	kwArgs:HashMap<any>;
	bindings:HashMap<BindingDeclaration>;
	events:HashMap<string|BindingDeclaration>;
}

/**
 * Creates a BindableWidget constructor from a template AST node.
 *
 * @param root The AST node to use as the root node for the constructed widget.
 * @param parent The direct parent for the new view, as in the case where the view constructor is created due to the
 * $ctor flag.
 * @param eventRoot The top-most widget to use as the target for string-based event names when encountering a widget
 * with inheritsModel. Kind of a hack.
 * @returns A constructor that instantiates a composed view tree based on the contents of the AST.
 */
function createViewConstructor(root:templating.INode, parent?:Widget, eventRoot?:Widget):typeof Widget {
	var BaseCtor = require<typeof Widget>(root.constructor);

	/**
	 * @constructor
	 */
	function TemplatedView(kwArgs:HashMap<any> = {}) {
		var self = this;
		var app:Application = kwArgs['app'] || this.get('app');

		if (!app) {
			throw new Error(
				'An instance of Application must be provided to templated views, either inherited from the parent ' +
				'prototype or passed on the "app" key to the constructor'
			);
		}

		var binder = app.get('binder');
		var model:{} = kwArgs['model'] || this.get('model') || (parent && parent.get('model'));
		// Empty object is used to satisfy the constraint of the current binding system that an object must always
		// be provided to create a binding
		var emptyObject = {};

		var modelInheritors:Widget[] = [];
		var handles:binding.IBindingHandle[] = [];

		function applyBindings(widget:Widget, bindings:HashMap<BindingDeclaration>) {
			for (var key in bindings) {
				var declaration = bindings[key];
				var sourcePath:any = declaration.$bind;

				// The PEG generates trees with nested `$bind` objects, but the CompositeBinding binder requires
				// objects with a `path` key instead of `$bind` key
				if (sourcePath instanceof Array) {
					sourcePath = sourcePath.map(function (part:string|BindingDeclaration):any {
						if (typeof part === 'string') {
							return part;
						}
						else {
							return { path: part.$bind };
						}
					});
				}

				handles.push(binder.bind({
					source: model || emptyObject,
					sourcePath: sourcePath,
					target: widget,
					targetPath: key,
					direction: declaration.direction
				}));
			}
		}

		function applyEvents(widget:Widget, events:HashMap<string|BindingDeclaration>) {
			function bindEvent(eventName:string, eventTarget:BindingDeclaration) {
				var binding = binder.createBinding<(event:ui.UiEvent) => void>(
					model || emptyObject,
					eventTarget.$bind,
					{ useScheduler: false }
				);

				widget.on(eventName, function (event:ui.UiEvent) {
					var listener = binding.get();
					if (listener) {
						listener.call(binding.getObject(), event);
					}
				});

				handles.push(<binding.IBindingHandle> {
					setSource(source:{}, sourcePath:string = eventTarget.$bind) {
						binding.destroy();
						binding = binder.createBinding<(event:ui.UiEvent) => void>(
							source || emptyObject,
							sourcePath,
							{ useScheduler: false }
						);
					},
					remove() {
						binding.destroy();
						binding = null;
					}
				});
			}

			for (var eventName in events) {
				var eventTarget = events[eventName];

				if (typeof eventTarget === 'string') {
					widget.on(eventName, function (event:ui.UiEvent) {
						(<any> eventRoot || self)[eventTarget] && (<any> eventRoot || self)[eventTarget](event);
					});
				}
				else {
					bindEvent(eventName, eventTarget);
				}
			}
		}

		function readNode(node:templating.INode):Widget|{} {
			if (util.isObject(node)) {
				if (typeof node.constructor === 'string') {
					return createWidget(node);
				}
				else if (node.$ctor) {
					return createViewConstructor(node.$ctor, self);
				}
				else {
					var kwArgs:{} = node instanceof Array ? [] : {};

					for (var key in node) {
						(<any> kwArgs)[key] = readNode(node[key]);
					}

					return kwArgs;
				}
			}
			else {
				return node;
			}
		}

		function createWidget(node:templating.INode):Widget {
			var Ctor = <TemplatingAwareWidgetConstructor> require(node.constructor);

			// Templating-aware widget types with `inheritsModel` need to have all interior bindings apply to their own
			// model, not the one from this parent widget; at the moment, the easiest way to do this is just to create
			// a new templated view constructor wrapping the original constructor, though it should be possible to do
			// this more efficiently by changing the target of `applyBindings` and `applyEvents`
			if (Ctor.inheritsModel) {
				Ctor = createViewConstructor(node, self, eventRoot || parent || self);
				instance = new Ctor({ app, model });
				modelInheritors.push(instance);
				return instance;
			}

			var initialState = getInitialState(node);
			initialState.kwArgs['app'] = app;

			var instance:Widget = new Ctor(initialState.kwArgs);

			applyBindings(instance, initialState.bindings);
			applyEvents(instance, initialState.events);

			return instance;
		}

		function getInitialState(node:templating.INode) {
			var kwArgs:HashMap<any> = {};
			var bindings:HashMap<BindingDeclaration> = {};
			var events:HashMap<string|BindingDeclaration> = {};

			for (var key in node) {
				var value = node[key];

				if (key === 'constructor') {
					continue;
				}

				if (/^on[A-Z]/.test(key)) {
					events[key.charAt(2).toLowerCase() + key.slice(3)] = value;
				}
				else if (value.$bind) {
					bindings[key] = value;
				}
				else {
					kwArgs[key] = readNode(value);
				}
			}

			return {
				kwArgs,
				bindings,
				events
			};
		}

		// TODO: Prevents children from being removed and adopted elsewhere; need to have widgets emit remove events
		// so that we can reparent them
		aspect.before(this, 'destroy', function () {
			var handle:IHandle;
			while ((handle = handles.pop())) {
				handle.remove();
			}
		});

		if (!('_modelGetter' in this)) {
			this._modelGetter = function () {
				return model;
			};
		}
		if (!('_modelSetter' in this)) {
			this._modelSetter = function (value:{}) {
				if (parent && !value) {
					value = <any> parent.get('model');
				}

				model = value;
			};
		}

		var initialState = getInitialState(root);
		BaseCtor.call(this, lang.mixin(initialState.kwArgs, kwArgs));

		this.observe('model', function (value:{}) {
			for (var i = 0, handle:binding.IBindingHandle; (handle = handles[i]); ++i) {
				handle.setSource(value || emptyObject);
			}
			for (var i = 0, child:Widget; (child = modelInheritors[i]); ++i) {
				child.set('model', value);
			}
		});

		applyBindings(this, initialState.bindings);
		applyEvents(this, initialState.events);
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
