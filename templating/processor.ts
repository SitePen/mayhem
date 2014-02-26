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

export var defaults:{ parser:templating.IParser; viewModuleId:string } = {
	parser: <templating.IParser> html.parser,
	viewModuleId: 'framework/ui/dom/ViewWidget'
};

function fillBindingTemplate(mediator:core.IMediator, template:any[]):string {
	return array.map(template, (item:any):any => {
		return item.$bind ? mediator.get(item.$bind) : item;
	}).join('');
}

function observeBindingTemplate(mediator:core.IMediator, template:any[], handler:() => void):IHandle[] {
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

export function constructWidget(node:any /* templating.IWidgetNode */ , options:any = {}):ui.IDomWidget {
	if (typeof node.constructor !== 'string') {
		throw new Error('Widget has non-string constructor');
	}
	var WidgetCtor:any = require(node.constructor),
		kwArgs:any = node.kwArgs, // TODO: ITemplateWidgetArgsNode
		key:string,
		value:any,
		binding:any,
		fieldBindings:{ [key:string]: string; } = {},
		bindingTemplates:{ [key:string]: any; } = {},
		widgetArgs:any = {};
	// A little clean up for the keys from our kwArgs before we can use them to construct a widget
	for (key in kwArgs) {
		value = kwArgs[key];
		if (value && value.$bind) {
			binding = value.$bind;
			// String binding paths are bidirectional field bindings
			if (typeof binding === 'string') {
				fieldBindings[key] = binding;
			}
			// Arrays are binding templates
			else if (binding instanceof Array) {
				bindingTemplates[key] = binding;
			}
			else {
				throw new Error('Unknown binding: ' + binding);
			}
		}
		else {
			// Pass non-binding values to widgetArgs unmolested
			widgetArgs[key] = value;
		}

		// TODO: what's the right thing to do here?
		if (!options.app && options.parent) {
			options.app = options.parent.get('app');
		}
	}

	//var widget:ui.IDomWidget = new WidgetCtor(lang.mixin({}, options, widgetArgs));
	var widget:ui.IDomWidget = new WidgetCtor(lang.mixin({}, { app: options.app }, widgetArgs));

	var content:any = node.content;
	if (content && content instanceof Array) {
		// Process and create placeholders for children and text bindings
		content = array.map(node.content, (item:any, i:number):string => {
			// Replace markers with comments that content widgets can process
			return typeof item === 'string' ? item : '<!-- ⟨⟨' + JSON.stringify(item) + '⟩⟩ -->';
		}).join('');
	}
	if (content) {
		widget.setContent(content);
	}

	if (node.children) {
		widget.set('children', array.map(node.children, (child:any):ui.IDomWidget => {
			//return constructWidget(child, lang.mixin({}, options));
			return constructWidget(child);
		}));
	}

	// TODO: explicitly add children when we finish refactoring
	// node.children && array.forEach(node.children, (child:any):ui.IDomWidget => {
	// 	widget.add(constructWidget(child, lang.mixin({}, options));
	// });

	var firstBind:boolean = true,
		observerHandles:IHandle[];
	var activeMediatorHandle = widget.observe('activeMediator', (mediator:core.IMediator) => {
		if (firstBind) {
			firstBind = false;
			for (key in fieldBindings) {
				widget.bind(key, fieldBindings[key], { direction: BindDirection.TWO_WAY });
			}
		}
		util.destroyHandles(observerHandles);
		observerHandles = [];
		// Observe bindings and accumulate binding handles
		array.forEach(util.getObjectKeys(bindingTemplates), (field:string) => {
			var template:any[] = bindingTemplates[field];
			observerHandles = observerHandles.concat(observeBindingTemplate(mediator, template, () => {
				widget.set(field, fillBindingTemplate(mediator, template));
			}));
		});
	});

	// Hook widget's destroy method to tear down our observer handles
	var _destroy:() => void = widget.destroy;
	widget.destroy = ():void => {
		util.destroyHandles(observerHandles);
		observerHandles = null;
		_destroy.call(widget);
	};

	return widget;
}



export function findDependencies(node:Object):string[] {
	// TODO: after refactor we'll only need to walk children and attribute values that are constructors
	var dependencies:string[] = [];
	function scan(node:Object):void {
		var ctor:any = node.constructor;
		if (typeof ctor === 'string') {
			if (!ctor) {
				node['constructor'+''] = ctor = defaults.viewModuleId;
			}
			// Add to list of dependencies if not already in our dep list
			dependencies.indexOf(ctor) === -1 && dependencies.push(ctor);
		}
		var key:string,
			value:any;
		for (key in node) {
			value = node[key];
			if (value instanceof Array) {
				array.forEach(value, scan);
			}
			else if (value && typeof value === 'object') {
				scan(value);
			}
		}
	}
	scan(node);
	return dependencies;
}

// Parses a template (if necessary), and returns a promise with an optional timeout for loader failure
export function process(graph:any /* templating.IWidgetNode */, timeout?:number):IPromise<ui.IWidget> {
	console.log('Widget Graph:', graph)
	var dfd:IDeferred<ui.IWidget> = new Deferred<ui.IWidget>(),
		timeoutHandle:number;
	require(findDependencies(graph), ():void => {
		clearTimeout(timeoutHandle);
		dfd.resolve(constructWidget(graph));
	});
	if (timeout) {
		timeoutHandle = setTimeout(():void => {
			dfd.reject(new Error('Timed out while loading depenencies'));
		});
	}
	return dfd;
}

export function processTemplate(template:string, parser?:templating.IParser, timeout?:number):IPromise<ui.IWidget> {
	parser || (parser = defaults.parser);
	return process(parser.parse(template), timeout);
}
