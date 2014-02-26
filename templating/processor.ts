/// <reference path="../dojo" />

import array = require('dojo/_base/array');
import BindDirection = require('../binding/BindDirection');
import core = require('../interfaces');
import Deferred = require('dojo/Deferred');
import lang = require('dojo/_base/lang');
import html = require('./html');
import templating = require('./interfaces');
import ui = require('../ui/interfaces');
import util = require('../util');

class Processor {
	static defaultModuleId:string = 'framework/ui/dom/ViewWidget';
	static defaultParser:templating.IParser = <templating.IParser> html.parser;

	static findDependencies(node:any /* templating.IWidgetNode */, dependencies:string[] = []):string[] {
		var kwArgs:any = node.kwArgs,
			children:any = node.children,
			ctor:any = node.constructor;
		if (typeof ctor !== 'string') {
			throw new Error('Widget constructor must be a string');
		}
		if (!ctor) {
			node['constructor'+''] = ctor = Processor.defaultModuleId;
		}
		// Dependency list has set semantics
		dependencies.indexOf(ctor) === -1 && dependencies.push(ctor);
		if (children) {
			for (var i = 0, len = children.length; i < len; ++i) {
				typeof children[i].constructor === 'string' && Processor.findDependencies(children[i], dependencies);
			}
		}
		if (kwArgs) {
			for (var key in kwArgs) {
				typeof kwArgs[key].constructor === 'string' && Processor.findDependencies(kwArgs[key], dependencies);
			}
		}
		return dependencies;
	}

	// Parses a template (if necessary), and returns a promise with an optional timeout for loader failure
	static process(node:any /* templating.IWidgetNode */, timeout?:number):IPromise<ui.IDomWidget> {
		console.log('AST:', node)
		var dfd:IDeferred<ui.IDomWidget> = new Deferred<ui.IDomWidget>(),
			timeoutHandle:number;
		require(Processor.findDependencies(node), ():void => {
			clearTimeout(timeoutHandle);
			dfd.resolve((new Processor(node).initialize()));
		});
		if (timeout) {
			timeoutHandle = setTimeout(():void => {
				dfd.reject(new Error('Timed out while loading depenencies'));
			});
		}
		return dfd;
	}

	static processTemplate(template:string, parser?:templating.IParser, timeout?:number):IPromise<ui.IDomWidget> {
		parser || (parser = Processor.defaultParser);
		return Processor.process(parser.parse(template), timeout);
	}

	private _bindingTemplates:{ [key:string]: any; };
	private _mediated:boolean;
	private _node:any;
	private _propertyBindings:{ [key:string]: string; };
	private _widget:ui.IDomWidget;
	private _widgetArgs:any;
	private _WidgetCtor:any;

	constructor(node:any /* templating.IWidgetNode */, options:any = {}) {
		if (typeof node.constructor !== 'string') {
			throw new Error('Widget node must have a string constructor');
		}

		this._node = node;
		this._WidgetCtor = require(node.constructor);
		this._bindingTemplates = {};
		this._propertyBindings = {};

		var kwArgs:any = node.kwArgs, // TODO: ITemplateWidgetOptionsNode
			widgetArgs:any = {},
			key:string,
			value:any,
			binding:any;
		for (key in kwArgs) {
			value = kwArgs[key];
			if (value && typeof value.constructor === 'string') {
				widgetArgs[key] = new Processor(value, {
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
					throw new Error('No handler for binding: ' + binding);
				}
			}
			else {
				// Pass non-binding values to widgetArgs unmolested
				widgetArgs[key] = value;
			}

			// TODO: what's the right thing to do here?
			// if (!options.app && options.parent) {
			// 	options.app = options.parent.get('app');
			// }
		}
		
		this._widgetArgs = lang.mixin({}, { app: options.app }, widgetArgs);
	}

	initialize():ui.IDomWidget {
		if (this._widget) {
			return this._widget;
		}
		var widget:ui.IDomWidget = this._widget = new this._WidgetCtor(this._widgetArgs);
		this._initializeContent();
		this._initializeChildren();
		this._initializeBindings();
		return widget;
	}

	private _initializeBindings() {
		var widget = this._widget,
			observerHandles:IHandle[],
			propertyBindings = this._propertyBindings,
			bindingTemplates = this._bindingTemplates;
		var activeMediatorHandle = widget.observe('activeMediator', (mediator:core.IMediator) => {
			if (!this._mediated) {
				this._mediated = true;
				for (var key in propertyBindings) {
					widget.bind(key, propertyBindings[key], { direction: BindDirection.TWO_WAY });
				}
			}
			util.destroyHandles(observerHandles);
			observerHandles = [];
			// Observe bindings and accumulate binding handles
			array.forEach(util.getObjectKeys(bindingTemplates), (field:string) => {
				var template:any[] = bindingTemplates[field];
				observerHandles = observerHandles.concat(this._observeBindingTemplate(mediator, template, () => {
					widget.set(field, this._processBindingTemplate(mediator, template));
				}));
			});
		});

		// Hook widget's destroy method to tear down our observer handles
		var _destroy:() => void = widget.destroy;
		widget.destroy = ():void => {
			util.destroyHandles(observerHandles);
			activeMediatorHandle.remove();
			observerHandles = activeMediatorHandle = null;
			_destroy.call(widget);
		};
	}

	private _initializeChildren() {
		var children:any = this._node.children;
		if (children) {
			this._widget.set('children', array.map(children, (child:any):ui.IDomWidget => {
				return new Processor(child).initialize();
			}));
		}

		// TODO: explicitly add children when we finish refactoring
		// children && array.forEach(children, (child:any):ui.IDomWidget => {
		// 	this._widget.add(new Processor(child).initialize());
		// });
	}

	private _initializeContent() {
		var content:any = this._node.content;
		if (content && content instanceof Array) {
			// Process and create placeholders for children and text bindings
			content = array.map(content, (item:any, i:number):string => {
				// Replace markers with comments that content widgets can process
				return typeof item === 'string' ? item : '<!-- ⟨⟨' + JSON.stringify(item) + '⟩⟩ -->';
			}).join('');
		}
		if (content) {
			this._widget.setContent(content);
		}
	}

	private _observeBindingTemplate(mediator:core.IMediator, template:any[], handler:() => void):IHandle[] {
		var observerHandles:IHandle[] = [];
		for (var i = 0, l = template.length; i < l; ++i) {
			var binding:string = template[i] && template[i].$bind;
			if (!binding) {
				continue;
			}
			observerHandles.push(mediator.observe(binding, handler));
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
}

export = Processor;
