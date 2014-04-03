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
		}
	}

	bidirectionalBindings:{ [key:string]: boolean; } = {};
	bindingTemplates:{ [key:string]: any; } = {};
	childFactories:WidgetFactory[] = [];
	content:Node;
	MARKER_PATTERN:RegExp = /^\s*⟨⟨ ({[^{]+}) ⟩⟩\s*$/;
	propertyBindings:{ [key:string]: string; } = {};
	propertyWidgetFactories:{ [key:string]: WidgetFactory; } = {};
	tree:templating.IParseTree;
	widgetArgs:any = {};
	WidgetCtor:typeof Widget;

	constructor(tree:templating.IParseTree, WidgetCtor?:typeof Widget) {
		// TODO: for widgets with ids to be cloned multiple times we need a way to transform child ids
		this.WidgetCtor = WidgetCtor || <typeof Widget> require(tree.constructor);
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

	/* protected */ _encodeMarker(marker:any):string {
		return '<!-- ⟨⟨ ' + JSON.stringify(marker) + ' ⟩⟩ -->';
	}

	private _initializeArgs():void {
		var kwArgs = this.tree.kwArgs,
			propertyWidgetFactories = this.propertyWidgetFactories,
			propertyBindings = this.propertyBindings,
			bidirectionalBindings = this.bidirectionalBindings,
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
					// Track whether binding should be bidirectional
					bidirectionalBindings[key] = value.bidirectional;
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
		// Transform marker objects into comments for children, placeholders and text bindings
		if (content instanceof Array) {
			var item:any;
			for (var i = 0, len = content.length; i < len; ++i) {
				item = content[i];
				value += typeof item === 'string' ? item : this._encodeMarker(item);
			}
		}
		if (value) {
			this.content = domUtil.toDom(value);
		}
	}
}

class _WidgetBinder {
	private _childMarkerNodes:Node[];
	private _childOptions:any;
	factory:WidgetFactory;
	private _mediatorHandle:IHandle;
	private _observerHandles:IHandle[];
	originView:ui.IView;
	propertyWidgetBinders:{ [key:string]:_WidgetBinder } = {};
	private _templateObservable:Observable;
	private _textBindingNodes:Node[] = [];
	private _textBindingPaths:string[] = [];
	private _textBindingHandles:IHandle[];
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
	}

	private _bindProperties():void {
		var widget = this.widget,
			view = this.getView(),
			propertyBindings = this.factory.propertyBindings,
			bidirectionalBindings = this.factory.bidirectionalBindings;
		for (var key in propertyBindings) {
			view.bind({
				sourceBinding: propertyBindings[key],
				target: widget,
				targetBinding: key,
				twoWay: bidirectionalBindings[key]
			});
		}
	}

	private _bindPropertyTemplates():void {
		var widget = this.widget,
			view = this.getView(),
			bindingTemplates = this.factory.bindingTemplates,
			template:any;

		// Build a map of all source bindings back to all binding templates which contain them
		var sourceMap:{ [key:string]: any[]; } = {};
		for (var key in bindingTemplates) {
			template = bindingTemplates[key];
			for (var i = 0, len = template.length; i < len; ++i) {
				var source:string = template[i].$bind;
				if (source) {
					// TODO: set should contain debounced evaluator functions instead
					var templateSet:any[] = sourceMap[source] || (sourceMap[source] = [])
					templateSet.indexOf(template) < 0 && templateSet.push(template);
				}
			}
		}

		// Bail if no keys in binding templates map
		if (!key) {
			return;
		}

		// Create an observable as a binding target and set up observers to signal template reprocessing
		var observerTarget = this._templateObservable = new Observable();
		util.remove.apply(null, this._observerHandles || []);
		this._observerHandles = [];
		array.forEach(util.getObjectKeys(sourceMap), (property:string) => {
			var templates:any[] = sourceMap[property];
			this._observerHandles.push(observerTarget.observe(property, () => {
				var mediator:data.IMediator = view.get('mediator');
				for (var i = 0, len = templates.length; i < len; ++i) {
					widget.set(getProperty(template), this._evaluateBindingTemplate(mediator, templates[i]));	
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

	destroy():void {
		this._observerHandles = util.remove.apply(null, this._observerHandles || []) && null;
		// TODO: moar
	}

	private _evaluateBindingTemplate(mediator:data.IMediator, template:any[]):string {
		return array.map(template, (item:any):any => {
			return item.$bind ? mediator.get(item.$bind) : item;
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
			if (descriptor.$bind != null) {
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
