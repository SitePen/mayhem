/// <reference path="../dojo" />

import array = require('dojo/_base/array');
import data = require('../data/interfaces');
import dom = require('../ui/dom/interfaces');
import Deferred = require('dojo/Deferred');
import has = require('../has');
import lang = require('dojo/_base/lang');
import html = require('./html');
import Observable = require('../Observable');
import Placeholder = require('../ui/Placeholder');
import PlacePosition = require('../ui/PlacePosition');
import Template = require('./Template');
import templating = require('./interfaces');
import ui = require('../ui/interfaces');
import util = require('../util');
import domUtil = require('../ui/dom/util');
import Widget = require('../ui/Widget');

class WidgetFactory {
	bindingTemplates:{ [key:string]: any; } = {};
	childFactories:WidgetFactory[] = [];
	content:Node;
	kwArgFactories:{ [key:string]: WidgetFactory; } = {};
	MARKER_PATTERN:RegExp = /^\s*⟨⟨ ({[^{]+}) ⟩⟩\s*$/;
	propertyBindings:{ [key:string]: string; } = {};
	tree:templating.IParseTree;
	widgetArgs:any = {};
	WidgetCtor:typeof Widget;

	constructor(tree:templating.IParseTree, WidgetCtor?:typeof Widget) {
		// TODO: for widgets with ids to be cloned multiple times we need a way to transform child ids
		this.WidgetCtor = WidgetCtor || <typeof Widget> require(tree.constructor);
		if (!((<any> this.WidgetCtor).prototype instanceof Widget)) {
			throw new Error('Factory can only construct Widget instances');
		}
		this.tree = tree;
		this._initializeArgs();
		this._initializeContent();
		this._initializeChildren();
	}

	create(options?:any):ui.IWidget {
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
			if (value && value.hasOwnProperty('constructor')) {
				// Initialize factory for widgets in kwArg
				kwArgFactories[key] = new WidgetFactory(value);
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
	private _templateObservable:Observable;
	private _textBindingNodes:Node[] = [];
	private _textBindingPaths:string[] = [];
	private _textBindingHandles:IHandle[];
	widget:ui.IWidget;
	private _widgetArgs:any;

	constructor(factory:WidgetFactory, options:any) {
		this.factory = factory;
		this._widgetArgs = lang.mixin({}, factory.widgetArgs, options);
		this._processKwArgWidgets();
		var widget = this.widget = new factory.WidgetCtor(this._widgetArgs);
		this._placeContent();
		this._placeChildren();
		this._bindProperties();
		this._bindPropertyTemplates();
		this._bindTextNodes();

		// Hook widget's destroy method to tear down the template
		var _destroy:() => void = widget.destroy;
		widget.destroy = ():void => {
			this._mediatorHandle && this._mediatorHandle.remove();
			this._mediatorHandle = null;
			this.destroy();
			_destroy.call(widget);
		};
	}

	private _bindProperties():void {
		var widget = <ui.IView> this.widget,
			propertyBindings = this.factory.propertyBindings;
		for (var key in propertyBindings) {
			// TODO: keep a reference to origin view and use its bind, setting widget as target
			widget.bind({
				sourceBinding: propertyBindings[key],
				targetBinding: key,
				twoWay: true
			});
		}
	}

	private _bindPropertyTemplates():void {
		var widget = <ui.IContentView> this.widget,
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

		// Create an observable as a binding target and set up observers to reprocess templates
		var target = this._templateObservable = new Observable();
		util.remove.apply(null, this._observerHandles || []);
		this._observerHandles = [];
		array.forEach(util.getObjectKeys(sourceMap), (property:string) => {
			var templates:any[] = sourceMap[property];
			this._observerHandles.push(target.observe(property, () => {
				var mediator:data.IMediator = widget.get('mediator');
				for (var i = 0, len = templates.length; i < len; ++i) {
					widget.set(getProperty(template), this._evaluateBindingTemplate(mediator, templates[i]));	
				}
			}));
		});

		var getProperty = (template:any) => {
			for (var key in bindingTemplates) {
				if (template === bindingTemplates[key]) {
					return key;
				}
			}
		}

		// Bind each source binding property with our observable as the target
		for (var property in sourceMap) {
			widget.bind({
				sourceBinding: property,
				target: target,
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
		var widget = <ui.IContentView> this.widget,
			node:Node,
			path:string;
		for (var i = 0, len = this._textBindingNodes.length; i < len; i++) {
			node = this._textBindingNodes[i];
			path = this._textBindingPaths[i];
			if (!node || !path) continue;
			this._textBindingHandles[i] = widget.bind({
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

	private _placeChildren():void {
		var childFactories = this.factory.childFactories,
			factory:WidgetFactory,
			widget:dom.IContainer = <dom.IContainer> this.widget,
			markerNodes = this._childMarkerNodes || [],
			item:dom.IWidget;
		for (var i = 0, len = childFactories.length; i < len; ++i) {
			factory = childFactories[i];
			if (factory) {
				item = <dom.IWidget> factory.create(); // TODO: child options?
				widget.add(item, i);
				// If a marker node exists move child to it
				var node = markerNodes[i];
				if (node) {
					widget._renderer.add(widget, item, node);
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
			if (node.nodeType === Node.COMMENT_NODE) {
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

	private _processKwArgWidgets():void {
		var kwArgFactories = this.factory.kwArgFactories,
			widgetArgs = this._widgetArgs;
		for (var key in kwArgFactories) {
			widgetArgs[key] = kwArgFactories[key].create(); // TODO: child options?
		}
	}
}

export = WidgetFactory;
