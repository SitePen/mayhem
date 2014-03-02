/// <reference path="../dojo" />

import array = require('dojo/_base/array');
import BindDirection = require('../binding/BindDirection');
import core = require('../interfaces');
import Deferred = require('dojo/Deferred');
import domConstruct = require('dojo/dom-construct');
import has = require('../has');
import lang = require('dojo/_base/lang');
import html = require('./html');
import Placeholder = require('../ui/dom/Placeholder');
import Template = require('./Template');
import templating = require('./interfaces');
import ui = require('../ui/interfaces');
import util = require('../util');

class DomWidgetFactory implements templating.IWidgetFactory {
	bindingTemplates:{ [key:string]: any; } = {};
	childFactories:DomWidgetFactory[] = [];
	content:Node;
	kwArgFactories:{ [key:string]: DomWidgetFactory; } = {};
	MARKER_PATTERN:RegExp = /^\s*⟨⟨ ({[^{]+}) ⟩⟩\s*$/;
	propertyBindings:{ [key:string]: string; } = {};
	tree:templating.IParseTree;
	widgetArgs:any = {};

	constructor(tree:templating.IParseTree) {
		// TODO: for widgets with ids to be cloned multiple times we need a way to transform child ids
		this.tree = tree;
		this._initializeArgs();
		this._initializeContent();
		this._initializeChildren();
	}

	create(options?:any):ui.IDomWidget {
		return new _WidgetBinder(this, options).widget;
	}

	destroy():void {
		// TODO: should we just destroy all binding handles, or tear down constructed widgets too?
	}

	/* protected */ _encodeMarker(marker:any):string {
		return '<!-- ⟨⟨ ' + JSON.stringify(marker) + ' ⟩⟩ -->';
	}

	private _initializeArgs():void {
		var kwArgs = this.tree.kwArgs,
			kwArgFactories = this.kwArgFactories,
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
			if (value && typeof value.constructor === 'string') {
				// Initialize factory for widgets in kwArg
				kwArgFactories[key] = new DomWidgetFactory(value);
			}
			else if (value && value.$bind) {
				binding = value.$bind;
				// Bind paths that are plain strings are bidirectional property bindings
				if (typeof binding === 'string') {
					this.propertyBindings[key] = binding;
				}
				// Arrays are binding templates
				else if (binding instanceof Array) {
					this.bindingTemplates[key] = binding;
				}
				else {
					if (has('debug')) {
						throw new Error('No handler for binding: ' + binding);
					}
				}
			}
			else {
				this.widgetArgs[key] = value;
			}
		}
	}

	private _initializeChildren():void {
		var children:templating.IParseTree[] = this.tree.children || [];
		for (var i = 0, len = children.length; i < len; ++i) {
			if (children[i]) {
				this.childFactories[i] = new DomWidgetFactory(children[i]);
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
			this.content = domConstruct.toDom(value);
		}
	}
}

class _WidgetBinder {
	private _activeMediatorHandle:IHandle;
	private _childMarkerNodes:Node[];
	private _childOptions:any;
	factory:DomWidgetFactory;
	private _observerHandles:IHandle[];
	private _textBindingNodes:Node[] = [];
	private _textBindingPaths:string[] = [];
	private _textBindingHandles:IHandle[];
	widget:ui.IDomWidget;
	private _widgetArgs:any;

	constructor(factory:DomWidgetFactory, options:any = {}) {
		this.factory = factory;
		this._widgetArgs = factory.widgetArgs; // lang.mixin({}, options, factory.widgetArgs);
		this._processKwArgWidgets();
		var WidgetCtor:any = require(factory.tree.constructor),
			widget:ui.IDomWidget = this.widget = new WidgetCtor(this._widgetArgs);
		this._processContent();
		this._processChildren();
		this._processBindings();

		// Hook widget's destroy method to tear down the template
		var _destroy:() => void = widget.destroy;
		widget.destroy = ():void => {
			this._activeMediatorHandle && this._activeMediatorHandle.remove();
			this._activeMediatorHandle = null;
			this.destroy();
			_destroy.call(widget);
		};
	}

	private _addChild(child:ui.IDomWidget, i:number) {
		var widget:ui.IDomWidget = this.widget,
			markerNodes:Node[] = this._childMarkerNodes,
			markerNode:Node = markerNodes && markerNodes[i];
		if (markerNode) {
			// Child was associated with a marker comment, so place it manually
			markerNode.parentNode.replaceChild(child.detach(), markerNode);
			child.set('parent', widget);
			widget.get('children')[i] = child;
		}
		else {
			(<ui.IWidgetContainer> widget).add(child, i);
		}
	}

	private _bindProperties():void {
		var widget:ui.IDomWidget = this.widget,
			propertyBindings = this.factory.propertyBindings;
		for (var key in propertyBindings) {
			widget.bind(key, propertyBindings[key], { direction: BindDirection.TWO_WAY });
		}
	}

	private _bindTemplates(mediator:core.IMediator):void {
		var widget:ui.IDomWidget = this.widget,
			bindingTemplates = this.factory.bindingTemplates;
		util.destroyHandles(this._observerHandles);
		this._observerHandles = [];
		// Observe bindings and accumulate binding handles
		array.forEach(util.getObjectKeys(bindingTemplates), (property:string) => {
			var template:any[] = bindingTemplates[property];
			this._observeBindingTemplate(mediator, template, () => {
				widget.set(property, this._evaluateBindingTemplate(mediator, template));
			});
		});
	}

	private _bindTextNodes():void {
		if (!this._textBindingNodes || !this._textBindingPaths) {
			return;
		}
		util.destroyHandles(this._textBindingHandles);
		this._textBindingHandles = [];
		var node:Node, path:string;
		for (var i = 0, len = this._textBindingNodes.length; i < len; i++) {
			node = this._textBindingNodes[i];
			path = this._textBindingPaths[i];
			if (!node || !path) continue;
			this._textBindingHandles[i] = this.widget.bind(node, path);
		}
	}

	destroy():void {
		// TODO
	}

	private _evaluateBindingTemplate(mediator:core.IMediator, template:any[]):string {
		return array.map(template, (item:any):any => {
			return item.$bind ? mediator.get(item.$bind) : item;
		}).join('');
	}

	private _observeBindingTemplate(mediator:core.IMediator, template:any[], handler:() => void):void {
		var observerHandles:IHandle[] = this._observerHandles;
		for (var i = 0, l = template.length; i < l; ++i) {
			var binding:string = template[i] && template[i].$bind;
			if (!binding) {
				continue;
			}
			observerHandles.push(mediator.observe(binding, handler));
			// Call handler one time to initialize fields with interpreted values
			handler();
		}
	}

	private _processBindings():void {
		var mediated:boolean;
		this._activeMediatorHandle = this.widget.observe('activeMediator', (mediator:core.IMediator) => {
			if (!mediator) {
				if (mediated) {
					// TODO: clean up bindings
				}
				return;
			}
			if (!mediated) {
				mediated = true;
				this._bindProperties();
				this._bindTextNodes();
			}
			this._bindTemplates(mediator);
		});
	}

	private _processChildren():void {
		var factory:DomWidgetFactory,
			childFactories = this.factory.childFactories;
		for (var i = 0, len = childFactories.length; i < len; ++i) {
			factory = childFactories[i];
			if (factory) {
				this._addChild(factory.create(), i); // TODO: child options?
			}
		}
	}

	private _processContent():void {
		if (this.factory.content) {
			var content:Node = this.factory.content.cloneNode(true);
			this._textBindingNodes = [];
			this._textBindingPaths = [];
			this._childMarkerNodes = [];
			this._processContentMarkers(content);
			this.widget.set('content', content);
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
			if (node.nodeType === Node.COMMENT_NODE) {
				this._processContentComment(node);
			}
			node = next;
		}
	}

	private _processContentComment(node:Node):void {
		var match:string[] = node.nodeValue.match(this.factory.MARKER_PATTERN),
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
				(<ui.IWidgetContainer> this.widget)._createPlaceholder(descriptor.$named, node);
			}
			else {
				if (has('debug')) {
					throw new Error('Unknown content marker: ' + JSON.stringify(descriptor));
				}
			}
		}
	}

	private _processKwArgWidgets():void {
		var kwArgFactories = this.factory.kwArgFactories,
			widgetArgs = this._widgetArgs;
		for (var key in kwArgFactories) {
			widgetArgs[key] = kwArgFactories[key].create(); // TODO: child options?
		}
	}
}

export = DomWidgetFactory;
