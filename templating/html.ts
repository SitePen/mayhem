import array = require('dojo/_base/array');
import BindDirection = require('../binding/BindDirection');
import core = require('../interfaces');
import dojotext = require('dojo/text');
import pegParser = require('./peg/html');
import widgets = require('../ui/interfaces');
import util = require('../util');

class Processor {

	static getWidgetCtor(node:any):any { // TODO: how to denote a Ctor return type?
		var ctor:any = node.constructor,
			moduleId:string;
		if (typeof ctor !== 'function') {
			moduleId = ctor.toString();
		}
		return moduleId ? require(moduleId) : ctor;
	}

	static load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void {
		dojotext.load(resourceId, contextRequire, function(template:string):void {
			var ast = Processor.parse(template);
			var dependencies = Processor.scanForDependencies(ast);
			require(dependencies, ():void => {
				load(function(app:core.IApplication, mediator:core.IMediator):widgets.IDomWidget {
					return Processor.widgetFromAst(ast, app, { mediator: mediator });
				});
			});
		});
	}

	static parse(input:string):any {
		return pegParser.parse(input);
	}

	static scanForDependencies(node:Object):string[] {
		var dependencies:string[] = [];
		function recurse(node:Object):void {
			var ctor = node.constructor;
			if (typeof ctor !== 'function') {
				// Parser returns constructors as either string or 1-element string[]
				// Either way toString should do the trick
				var moduleId:string = ctor.toString();
				// Add to list of dependencies if it's a string module id not already in our dep list
				dependencies.indexOf(moduleId) === -1 && dependencies.push(moduleId);
			}
			var key:string;
			for (key in node) {
				var value:any = node[key];
				if (value instanceof Array) {
					array.forEach(value, recurse);
				}
				else if (typeof value === 'object') {
					recurse(value);
				}
			}
		}
		recurse(node);
		return dependencies;
	}

	static widgetFromAst(node:any, app:any, kwArgs:{
		mediator?:core.IMediator;
		parent?:widgets.IDomWidget
	}):widgets.IDomWidget {
		var options:any = {},
			mediator:core.IMediator = kwArgs.mediator || kwArgs.parent.get('mediator'),
			key:string,
			items:any,
			WidgetCtor = Processor.getWidgetCtor(node),
			widget:widgets.IDomWidget,
			fieldBindings:{ [key:string]: string; } = {},
			bindingTemplates:{ [key:string]: any; } = {};

		// A little clean up for the keys from our node before we can use them to construct a widget
		for (key in node) {
			items = node[key];
			if (items === undefined) {
				// Treat undefined keys as non-existent
			}
			else if (key === 'constructor' || key === 'children') {
				// Ignore these keys since we handle them later
			}
			else if (key === 'html') {
				// Don't bother with bindings on html -- Element uses its own mechanism
				options[key] = items;
			}
			else if (!(items instanceof Array)) {
				// Pass non-array items through to options unmolested
				options[key] = items;
			}
			else if (array.some(items, (item:any):boolean => util.isObject(item) && !item.binding)) {
				// If there are any complex objects that aren't binding also pass through
				// TODO: this is another place we have to dance around complex keys (e.g. Conditional's conditions key)
				options[key] = items;
			}
			else if (items.length === 1 && items[0] && items[0].binding) {
				// Set up field binding when parts is a single element binding descriptor
				fieldBindings[key] = items[0].binding;
			}
			else {
				bindingTemplates[key] = items;
			}
		}

		options.app = app;
		if (kwArgs.parent) {
			options.parent = kwArgs.parent;
		}
		if (kwArgs.mediator) {
			options.mediator = kwArgs.mediator;
		}
		widget = new WidgetCtor(options);

		function observeBindingTemplate(field:string, items:any[]):IHandle[] {
			var handles:IHandle[] = [];
			for (var i = 0, length = items.length; i < length; ++i) {
				var binding:string = items[i] && items[i].binding;
				if (!binding) {
					continue;
				}
				handles.push(mediator.observe(binding, ():void => {
					// TODO: something lke widget.bind(productProxy(items), field);
					// Flatten out array String|Binding array, filling in the bindings
					widget.set(field, array.map(items, (item:any):any => {
						return item.binding ? mediator.get(item.binding) : item;
					}).join(''));
				}));
			}
			return handles;
		}
		var observerHandles:IHandle[] = [];

		// TODO: find a way to avoid these post-construction tasks
		if (node.children) {
			widget.set('children', array.map(node.children, (child:any):widgets.IDomWidget => {
				return Processor.widgetFromAst(child, app, { parent: widget });
			}));
		}
		// We need to defer binding setup until after widget construction
		for (key in fieldBindings) {
			widget.bind(key, fieldBindings[key], { direction: BindDirection.TWO_WAY });
		}
		for (key in bindingTemplates) {
			observerHandles.concat(observeBindingTemplate(key, bindingTemplates[key]));
		}
		// TODO: stash observerHandles on widget and make sure they're cleaned up
		return widget;
	}
}

export = Processor;
