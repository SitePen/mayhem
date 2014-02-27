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
import templating = require('./interfaces');
import ui = require('../ui/interfaces');
import util = require('../util');

var MARKER_PATTERN:RegExp = /^\s*⟨⟨ ({[^{]+}) ⟩⟩\s*$/;

class TemplateProcessor {
	static defaultParser:templating.IParser = <templating.IParser> html.parser;

	static findDependencies(node:any /* templating.IWidgetNode */, dependencies:string[] = []):string[] {
		var ctor:any = node.constructor;
		if (typeof ctor !== 'string') {
			throw new Error('Widget constructor must be a string');
		}
		// Dependency list has set semantics
		dependencies.indexOf(ctor) === -1 && dependencies.push(ctor);
		var children:any = node.children,
			child:any;
		if (children) {
			for (var i = 0, len = children.length; i < len; ++i) {
				child = children[i];
				if (child && typeof child.constructor) {
					this.findDependencies(child, dependencies);
				}
			}
		}
		var kwArgs:any = node.kwArgs,
			value:any;
		if (kwArgs) {
			for (var key in kwArgs) {
				value = kwArgs[key];
				if (value && typeof value.constructor === 'string') {
					this.findDependencies(value, dependencies);
				}
			}
		}
		return dependencies;
	}

	// Parses a template (if necessary), and returns a promise with an optional timeout for loader failure
	static process(node:any /* templating.IWidgetNode */, timeout?:number):IPromise<ui.IDomWidget> {
		console.log('AST:', node)
		var dfd:IDeferred<ui.IDomWidget> = new Deferred<ui.IDomWidget>(),
			timeoutHandle:number;
		require(this.findDependencies(node), ():void => {
			clearTimeout(timeoutHandle);
			dfd.resolve((new TemplateProcessor(node).initialize()));
		});
		if (timeout) {
			timeoutHandle = setTimeout(():void => {
				dfd.reject(new Error('Timed out while loading depenencies'));
			});
		}
		return dfd;
	}

	static processTemplate(template:string, parser?:templating.IParser, timeout?:number):IPromise<ui.IDomWidget> {
		parser || (parser = this.defaultParser);
		return this.process(parser.parse(template), timeout);
	}

	private _activeMediatorHandle:IHandle;
	private _astNode:any;
	private _bindingTemplates:{ [key:string]: any; };
	private _childPlaceholders:Placeholder[];
	private _mediated:boolean;
	private _propertyBindings:{ [key:string]: string; };
	private _observerHandles:IHandle[];
	private _textBindingHandles:IHandle[];
	private _textBindingNodes:Node[];
	private _textBindingPaths:string[];
	private _widget:ui.IDomWidget;
	private _widgetArgs:any;
	private _WidgetCtor:any;

	constructor(astNode:any /* templating.IWidgetNode */, options:any = {}) {
		this._astNode = astNode;
		this._WidgetCtor = options.ctor || require(astNode.constructor);
		this._bindingTemplates = {};
		this._propertyBindings = {};

		var kwArgs:any = astNode.kwArgs, // TODO: ITemplateWidgetOptionsNode
			widgetArgs:any = {},
			key:string,
			value:any,
			binding:any;
		for (key in kwArgs) {
			value = kwArgs[key];
			if (value && typeof value.constructor === 'string') {
				widgetArgs[key] = new TemplateProcessor(value, {
					app: options.app,
					parent: this
				}).initialize();
			}
			else if (value && value.$bind) {
				binding = value.$bind;
				// Bind paths that are plain strings are bidirectional property bindings
				if (typeof binding === 'string') {
					this._propertyBindings[key] = binding;
				}
				// Arrays are binding templates
				else if (binding instanceof Array) {
					this._bindingTemplates[key] = binding;
				}
				else {
					if (has('debug')) {
						throw new Error('No handler for binding: ' + binding);
					}
				}
			}
			else {
				// Pass non-binding values to widgetArgs unmolested
				widgetArgs[key] = value;
			}
		}
		
		this._widgetArgs = lang.mixin({}, { app: options.app }, widgetArgs);
	}

	private _addChild(child:ui.IDomWidget, i:number) {
		var widget:ui.IWidgetContainer = <ui.IWidgetContainer> this._widget,
			placeholder:Placeholder = this._childPlaceholders && this._childPlaceholders[i];
		if (placeholder) {
			// Child was associated with a marker comment, so place it manually
			child.set('parent', widget);
			widget.get('children')[i] = widget;
			widget.set('content', child);
		}
		else {
			widget.add(child, i);
		}
	}

	private _bindProperties():void {
		var widget = this._widget,
			propertyBindings = this._propertyBindings;
		for (var key in propertyBindings) {
			widget.bind(key, propertyBindings[key], { direction: BindDirection.TWO_WAY });
		}
	}

	private _bindTemplates(mediator:core.IMediator):void {
		var widget = this._widget,
			bindingTemplates = this._bindingTemplates;
		util.destroyHandles(this._observerHandles);
		this._observerHandles = [];
		// Observe bindings and accumulate binding handles
		array.forEach(util.getObjectKeys(bindingTemplates), (property:string) => {
			var template:any[] = bindingTemplates[property];
			this._observerHandles = this._observerHandles.concat(this._observeBindingTemplate(mediator, template, () => {
				widget.set(property, this._processBindingTemplate(mediator, template));
			}));
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
			this._textBindingHandles[i] = this._widget.bind(node, path);
		}
	}

	destroy():void {
		this._activeMediatorHandle && this._activeMediatorHandle.remove();
		util.destroyHandles(this._observerHandles);
		this._activeMediatorHandle = this._observerHandles = null;
		// TODO: moar cleanup
	}

	initialize():ui.IDomWidget {
		if (this._widget) {
			throw new Error('Cannot reinitialize widget processor');
		}
		var widget:ui.IDomWidget = this._widget = new this._WidgetCtor(this._widgetArgs),
			node:any = this._astNode;

		this._initializeContent(node.content);
		this._initializeChildren(node.children);
		this._initializeBindings();

		// Hook widget's destroy method to tear down ourself
		var _destroy:() => void = widget.destroy;
		widget.destroy = ():void => {
			this.destroy();
			_destroy.call(widget);
		};

		return widget;
	}

	private _initializeBindings():void {
		this._activeMediatorHandle = this._widget.observe('activeMediator', (mediator:core.IMediator) => {
			if (!this._mediated && mediator) {
				this._mediated = true;
				this._bindProperties();
				this._bindTextNodes();
			}
			this._bindTemplates(mediator);
		});
	}

	private _initializeChildren(children:any):void {
		for (var i = 0, len = children ? children.length : 0; i < len; ++i) {
			if (children[i]) {
				this._addChild(new TemplateProcessor(children[i]).initialize(), i);
			}
		}
	}

	private _initializeContent(content:any):void {
		var value:string = typeof content === 'string' ? content : '';
		// Transform marker objects into comments for children, placeholders and text bindings
		if (content instanceof Array) {
			var item:any;
			for (var i = 0, len = content.length; i < len; ++i) {
				item = content[i];
				value += typeof item === 'string' ? item : '<!-- ⟨⟨ ' + JSON.stringify(item) + ' ⟩⟩ -->';
			}
		}
		if (value) {
			var node:Node = domConstruct.toDom(value);
			this._processContent(node);
			this._widget.set('content', node);
		}
	}

	private _observeBindingTemplate(mediator:core.IMediator, template:any[], handler:() => void):IHandle[] {
		var observerHandles:IHandle[] = [];
		for (var i = 0, l = template.length; i < l; ++i) {
			var binding:string = template[i] && template[i].$bind;
			if (!binding) {
				continue;
			}
			this._observerHandles.push(mediator.observe(binding, handler));
			// Call handler one time to initialize fields with interpreted values
			handler();
		}
		return observerHandles;
	}

	private _processBindingTemplate(mediator:core.IMediator, template:any[]):string {
		return array.map(template, (item:any):any => {
			return item.$bind ? mediator.get(item.$bind) : item;
		}).join('');
	}

	private _processContent(node:Node):void {
		// Initialize
		this._textBindingNodes = [];
		this._textBindingPaths = [];
		this._childPlaceholders = [];
		// Recurse and handle comments standing in for child and binding placeholders
		var next:Node;
		while (node != null) {
			// Capture next sibling before manipulating dom
			next = node.nextSibling;
			for (var i = 0, len = node.childNodes.length; i < len; ++i) {
				this._processContent(node.childNodes[i]);
			}
			if (node.nodeType === Node.COMMENT_NODE) {
				this._processContentComment(node);
			}
			node = next;
		}
	}

	private _processContentComment(node:Node) {
		var match:string[] = node.nodeValue.match(MARKER_PATTERN),
			descriptor:any = match && JSON.parse(match[1]);
		if (descriptor) {
			this._processMarker(descriptor, node);
		}
	}

	private _processMarker(descriptor:any, node:Node):void {
		var parent:Node = node.parentNode;
		if (descriptor.$bind != null) {
			var textNode:Text = new Text();
			this._textBindingNodes.push(textNode);
			this._textBindingPaths.push(descriptor.$bind);
			parent.replaceChild(textNode, node);
		}
		else if (descriptor.$child != null) {
			var placeholder:Placeholder = this._childPlaceholders[descriptor.$child] = new Placeholder();
			parent.replaceChild(placeholder.detach(), node);
		}
		else if (descriptor.$named != null) {
			(<ui.IWidgetContainer> this._widget).createPlaceholder(descriptor.$named, node);
		}
		else {
			if (has('debug')) {
				throw new Error('Unknown content marker: ' + JSON.stringify(descriptor));
			}
		}
	}
}

export = TemplateProcessor;
