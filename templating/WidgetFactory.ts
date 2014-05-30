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
				propertyBindings[key] = value.$bind;
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
			// Find html element heads with at least one attribute binding and fix them up
			value = value.replace(/<[^>]+⟨⟨ \d+ ⟩⟩[^>]*>/g, (match:string):string => {
				var attributes:any = {},
					// Replace all Loop over all binding attributes
					head:string = match.replace(/\s+([a-zA-Z_:][-\w:.]*)\s*=\s*(["']?)⟨⟨ (\d+) ⟩⟩(["']?)/g, (match:string, name:string, open:string, id:string, close:string):string => {
						// Check for matching quotes (if any) and punt if unbalanced
						if (has('debug') && open !== close) {
							throw new Error('Invalid binding in HTML attribute: ' + match);
						}
						// Grab binding from content attribute and assign to attribute
						attributes[name] = content[Number(id)].$bind;
						// Wipe out any attributes with bindings in our element html
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
	originView:ui.IView;
	propertyWidgetBinders:{ [key:string]:_WidgetBinder } = {};
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
			if (!element || !config) {
				continue;
			}
			for (var attributeName in config) {
				this._attributeBindingHandles.push(view.bind({
					sourceBinding: config[attributeName],
					target: element,
					targetBinding: '@' + attributeName
				}));
			}
		}
		// TODO: sniff for widget body reset and destroy these bindings
	}

	destroy():void {
		// TODO
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
