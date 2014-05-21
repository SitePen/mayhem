/// <reference path="../dojo" />

import array = require('dojo/_base/array');
import data = require('../data/interfaces');
import dom = require('../ui/dom/interfaces');
import domUtil = require('../ui/dom/util');
import Deferred = require('dojo/Deferred');
import has = require('../has');
import lang = require('dojo/_base/lang');
import html = require('./html');
import Observable = require('../Observable');
import Placeholder = require('../ui/Placeholder');
import PlacePosition = require('../ui/PlacePosition');
import templating = require('./interfaces');
import ui = require('../ui/interfaces');
import util = require('../util');
import Widget = require('../ui/Widget');

class WidgetFactory {
	static getConstructor(tree:templating.IParseTree, CtorOverride?:any):templating.IWidgetConstructor {
		var factory = new WidgetFactory(tree, CtorOverride);
		return <templating.IWidgetConstructor> function(options?:any):ui.IWidget {
			return factory.create(options);
		};
	}

	bindingTemplates:{ [key:string]: any; } = {};
	childFactories:WidgetFactory[] = [];
	content:Node;
	MARKER_PATTERN:RegExp = /^\s*⟨⟨ ({[^⟩][^⟩]+}) ⟩⟩\s*$/;
	propertyBindings:{ [key:string]: string; } = {};
	propertyWidgetFactories:{ [key:string]: WidgetFactory; } = {};
	tree:templating.IParseTree;
	widgetArgs:any = {};
	WidgetCtor:typeof Widget;

	constructor(tree:templating.IParseTree, ctor?:typeof Widget) {
		// TODO: for widgets with ids to be cloned multiple times we need a way to transform child ids
		ctor = this.WidgetCtor = ctor || <typeof Widget> require(tree.constructor);

		if (has('debug') && !(ctor.prototype instanceof Widget || ctor instanceof WidgetFactory)) {
			console.warn('Invalid widget constructor:', this.WidgetCtor);
			throw new Error('Invalid widget constructor provided');
		}

		this.tree = tree;
		this._initializeArgs();
		this._initializeContent();
		this._initializeChildren();
	}

	create(options?:any):ui.IWidget {
		var binder = new _WidgetBinder(this, options);
		// TODO: allow containing view to be specified?
		binder.attachBindings();
		return binder.widget;
	}

	destroy():void {
		// TODO: should we just destroy all binding handles, or tear down constructed widgets too?
	}

	private _initializeArgs():void {
		var kwArgs = this.tree.kwArgs,
			propertyWidgetFactories = this.propertyWidgetFactories,
			propertyBindings = this.propertyBindings,
			bindingTemplates = this.bindingTemplates,
			widgetArgs = this.widgetArgs,
			key:string,
			value:any,
			binding:any;
		if (!kwArgs) {
			return;
		}

		for (key in kwArgs) {
			value = kwArgs[key];
			if (value && value.hasOwnProperty('constructor')) {
				// Initialize factory for widgets in kwArg
				propertyWidgetFactories[key] = new WidgetFactory(value);
			}
			else if (value && value.$ctor) {
				widgetArgs[key] = WidgetFactory.getConstructor(value.$ctor);
			}
			else if (value && value.$bind) {
				binding = value.$bind;
				// Bind paths that are plain strings are property bindings
				if (typeof binding === 'string') {
					propertyBindings[key] = binding;
				}
				// Arrays are binding templates
				else if (binding instanceof Array) {
					bindingTemplates[key] = binding;
				}
				else {
					if (has('debug')) {
						throw new Error('No handler for this kind of binding: ' + binding);
					}
				}
			}
			else {
				widgetArgs[key] = value;
			}
		}
	}

	private _initializeChildren():void {
		var children:templating.IParseTree[] = this.tree.children || [];
		for (var i = 0, len = children.length; i < len; ++i) {
			if (children[i]) {
				this.childFactories[i] = new WidgetFactory(children[i]);
			}
		}
	}

	private _initializeContent():void {
		var content:any = this.tree.content,
			value:string = typeof content === 'string' ? content : '';
		// Transform marker objects into a simple pattern in the content string that we can patch up later
		if (content instanceof Array) {
			for (var i = 0, len = content.length; i < len; ++i) {
				var item:any = content[i];
				value += typeof item === 'string' ? item : ('⟨⟨ ' + i + ' ⟩⟩');
			}
		}
		if (value) {
			// Find html element heads with at lesat one attribute binding and fix them up
			value = value.replace(/<[^>]+⟨⟨ \d+ ⟩⟩[^>]*>/g, (match:string):string => {
				var attributes:any = {},
					// Replace all Loop over all attributes with any value at all
					head:string = match.replace(/\s+([a-zA-Z_:][-\w:.]*)\s*=\s*('[^']+'|"[^"]+"|[^'"\s]+)/g, (match:string, name:string, value:string):string => {
						// Strip off enclosing quotes, if any
						if ((value.indexOf("'") === 0 || value.indexOf('"') === 0)) {
							value = value.substr(1, value.length - 2);
						}
						// Find all bindings in this attribute (split on any binding markers)
						var parts:string[] = value.split(/⟨⟨ (\d+) ⟩⟩/g);
						if (parts.length === 1) {
							// No bindings so return untouched
							return match;
						}

						// Make a binding template out of the value array
						attributes[name] = array.filter(array.map(parts, (part:string, i:number):any => {
							// Even elements are strings, odd elements are indexes of bindings
							return i % 2 === 0 ? part : content[Number(part)];
						}), (value:any):any => value);
						// Wipe out attributes with bindings in our html
						return '';
				});

				// Insert an attribute binding marker comment just before the element head we're binding
				return '<!-- ⟨⟨ ' + JSON.stringify({ $attributes: attributes }) + ' ⟩⟩ -->' + head;
			});

			// Replace text node bindings with html comments
			value = value.replace(/⟨⟨ (\d+) ⟩⟩/g, (match:string, index:string):string => {
				return '<!-- ⟨⟨ ' + JSON.stringify(content[Number(index)]) + ' ⟩⟩ -->';
			});
			this.content = domUtil.toDom(value);
		}
	}
}

class _WidgetBinder {
	private _attributeBindingHandles:IHandle[];
	private _attributeBindingNodes:HTMLElement[] = [];
	private _attributeBindingPaths:any[] = [];
	private _childMarkerNodes:Node[];
	private _childOptions:any;
	factory:WidgetFactory;
	private _modelHandle:IHandle;
	private _observerHandles:IHandle[];
	originView:ui.IView;
	propertyWidgetBinders:{ [key:string]:_WidgetBinder } = {};
	private _templateObservable:Observable;
	private _textBindingHandles:IHandle[];
	private _textBindingNodes:Node[] = [];
	private _textBindingPaths:string[] = [];
	widget:ui.IWidget;
	private _widgetArgs:any;

	constructor(factory:WidgetFactory, options:any = {}) {
		this.factory = factory;
		this._widgetArgs = lang.mixin({}, factory.widgetArgs, options);
		// Create attribute children before widget so we can pass them to the ctor
		this._processPropertyWidgetFactories();
		var widget = this.widget = new factory.WidgetCtor(this._widgetArgs);
		this._processPropertyWidgetBinders();
		this._placeContent();
		this._placeChildren();

		// Hook widget's destroy method for binder teardown
		var _destroy:() => void = widget.destroy;
		widget.destroy = ():void => {
			this.destroy();
			_destroy.call(widget);
		};
	}

	attachBindings():void {
		this._bindProperties();
		this._bindPropertyTemplates();
		this._bindTextNodes();
		this._bindAttributeNodes();
	}

	private _bindProperties():void {
		var widget = this.widget,
			view = this.getView(),
			propertyBindings = this.factory.propertyBindings;

		for (var key in propertyBindings) {
			view.bind({
				sourceBinding: propertyBindings[key],
				target: widget,
				targetBinding: key,
				twoWay: true // Always bind bidirectionally for widget properties
			});
		}
	}

	private _bindPropertyTemplates():void {
		var widget = this.widget,
			view = this.getView(),
			bindingTemplates = this.factory.bindingTemplates,
			template:any,
			sourceMap:{ [key:string]: any[]; } = {},
			keys:string[];

		// Build a map of all source bindings back to all binding templates which contain them
		keys = array.map(util.getObjectKeys(bindingTemplates), (key:string):string => {
			template = bindingTemplates[key];
			for (var i = 0, len = template.length; i < len; ++i) {
				var source:string = template[i].$bind;
				if (source) {
					// TODO: set should contain debounced evaluator functions instead
					var templateSet:any[] = sourceMap[source] || (sourceMap[source] = [])
					templateSet.indexOf(template) === -1 && templateSet.push(template);
				}
			}
			return key;
		});

		// Bail if no keys in binding templates map
		if (!keys.length) {
			return;
		}

		// Create an observable as a binding target and set up observers to signal template reprocessing
		var observerTarget = this._templateObservable = new Observable();
		util.remove.apply(null, this._observerHandles || []);
		this._observerHandles = [];
		array.forEach(util.getObjectKeys(sourceMap), (property:string) => {
			var templates:any[] = sourceMap[property];
			this._observerHandles.push(observerTarget.observe(property, () => {
				var model:data.IMediator = view.get('model');
				for (var i = 0, len = templates.length; i < len; ++i) {
					widget.set(getProperty(templates[i]), this._evaluateBindingTemplate(model, templates[i]));	
				}
			}));
		});

		var getProperty = (template:any):string => {
			for (var key in bindingTemplates) {
				if (template === bindingTemplates[key]) {
					return key;
				}
			}
		}

		// Bind each source binding property with our observable as the target
		for (var property in sourceMap) {
			view.bind({
				sourceBinding: property,
				target: observerTarget,
				targetBinding: property
			});
		}
	}

	private _bindTextNodes():void {
		if (!this._textBindingNodes || !this._textBindingPaths) {
			return;
		}
		util.remove.apply(null, this._textBindingHandles || []);
		this._textBindingHandles = [];
		var view = this.getView(),
			node:Node,
			path:string;
		for (var i = 0, len = this._textBindingNodes.length; i < len; i++) {
			node = this._textBindingNodes[i];
			path = this._textBindingPaths[i];
			if (!node || !path) continue;
			this._textBindingHandles[i] = view.bind({
				sourceBinding: path,
				target: node,
				targetBinding: 'nodeValue'
			});
		}
		// TODO: destroy these bindings when widget body gets wiped out
	}

	private _bindAttributeNodes():void {
		if (!this._attributeBindingNodes || !this._attributeBindingPaths) {
			return;
		}
		util.remove.apply(null, this._attributeBindingHandles || []);
		this._attributeBindingHandles = [];
		var view = this.getView(),
			element:HTMLElement,
			config:any;
		for (var i = 0, len = this._attributeBindingNodes.length; i < len; i++) {
			element = this._attributeBindingNodes[i];
			config = this._attributeBindingPaths[i];
			if (!element || !config) continue;
			for (var attributeName in config) {
				this._attributeBindingHandles.push(view.bind({
					// TODO: support binding templates (right now we can only do direct bindings)
					sourceBinding: config[attributeName][0].$bind,
					target: element,
					targetBinding: '@' + attributeName
				}));
			}
		}
		// TODO: destroy these bindings when widget body gets wiped out
	}

	destroy():void {
		this._observerHandles = util.remove.apply(null, this._observerHandles || []) && null;
		// TODO: moar
	}

	private _evaluateBindingTemplate(model:data.IMediator, template:any[]):string {
		return array.map(template, (item:any):any => {
			return item.$bind ? model.get(item.$bind) : item;
		}).join('');
	}

	getView():ui.IView {
		return this.widget['bind'] ? <ui.IView> this.widget : this.originView;
	}

	private _placeChildren():void {
		var childFactories = this.factory.childFactories,
			factory:WidgetFactory,
			container:dom.IContainer = <dom.IContainer> this.widget,
			markerNodes = this._childMarkerNodes || [],
			binder:_WidgetBinder,
			item:dom.IWidget;
		for (var i = 0, len = childFactories.length; i < len; ++i) {
			factory = childFactories[i];
			if (factory) {
				// Create and attach bindings to child widget
				binder = new _WidgetBinder(factory); // TODO: child options?
				binder.originView = container;
				binder.attachBindings();
				item = <dom.IWidget> binder.widget;
				container.add(item, i);
				// If a marker node exists for child index use it to place child
				var node = markerNodes[i];
				if (node) {
					container._renderer.add(container, item, node, PlacePosition.REPLACE);
				}
			}
		}
	}

	private _placeContent():void {
		if (this.factory.content) {
			var content = this.factory.content.cloneNode(true);
			this._attributeBindingNodes = [];
			this._attributeBindingPaths = [];
			this._textBindingNodes = [];
			this._textBindingPaths = [];
			this._childMarkerNodes = [];
			this._processContentMarkers(content);
			(<ui.IContentView> this.widget).setContent(content);
		}
	}

	private _processContentMarkers(node:Node):void {
		// Recurse and handle comments standing in for child and binding placeholders
		var next:Node;
		while (node != null) {
			// Capture next sibling before manipulating dom
			next = node.nextSibling;
			for (var i = 0, len = node.childNodes.length; i < len; ++i) {
				this._processContentMarkers(node.childNodes[i]);
			}
			if (node.nodeType === 8 /* Node.COMMENT_NODE */) {
				this._processContentComment(node);
			}
			node = next;
		}
	}

	private _processContentComment(node:Node):void {
		var widget = <ui.IContentView> this.widget,
			match:string[] = node.nodeValue.match(this.factory.MARKER_PATTERN),
			descriptor:any = match && JSON.parse(match[1]);
		if (descriptor) {
			var parent:Node = node.parentNode;
			if (descriptor.$attributes != null) {
				var attributes = descriptor.$attributes;
				// TODO: nextElementSibling is defined on ElementTraversal, which conflicts with Node
				this._attributeBindingNodes.push((<any> node).nextElementSibling);
				this._attributeBindingPaths.push(attributes);
				// Leave binding comment in place but clean up a bit
				node.nodeValue = ' Mayhem HTML element bindings: ' + JSON.stringify(attributes) + ' ';
			}
			else if (descriptor.$bind != null) {
				var textNode:Text = new Text();
				this._textBindingNodes.push(textNode);
				this._textBindingPaths.push(descriptor.$bind);
				parent.replaceChild(textNode, node);
			}
			else if (descriptor.$child != null) {
				this._childMarkerNodes[descriptor.$child] = node;
			}
			else if (descriptor.$named != null) {
				var name:string = descriptor.$named,
					placeholder = widget.placeholders[name] = new Placeholder();
				domUtil.place(placeholder['_outerFragment'], node, PlacePosition.REPLACE);
				placeholder.set('parent', widget);
			}
			else {
				if (has('debug')) {
					throw new Error('Unknown content marker: ' + JSON.stringify(descriptor));
				}
			}
		}
	}

	private _processPropertyWidgetBinders():void {
		var propertyWidgetBinders = this.propertyWidgetBinders,
			view:ui.IView = this.getView(),
			binder:_WidgetBinder;
		for (var key in propertyWidgetBinders) {
			binder = propertyWidgetBinders[key];
			binder.originView = view;
			binder.attachBindings();
		}
	}

	private _processPropertyWidgetFactories():void {
		var propertyWidgetFactories = this.factory.propertyWidgetFactories,
			propertyWidgetBinders = this.propertyWidgetBinders,
			widgetArgs = this._widgetArgs,
			factory:WidgetFactory,
			binder:_WidgetBinder;
		for (var key in propertyWidgetFactories) {
			factory = propertyWidgetFactories[key];
			binder = propertyWidgetBinders[key] = new _WidgetBinder(factory); // TODO: child options?
			widgetArgs[key] = binder.widget;
		}
	}
}

export = WidgetFactory;
