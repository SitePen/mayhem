import array = require('dojo/_base/array');
import BindDirection = require('../binding/BindDirection');
import core = require('../interfaces');
import dojotext = require('dojo/text');
import pegParser = require('./peg/html');
import widgets = require('../ui/interfaces');
import util = require('../util');

class Processor {

	static getWidgetCtor(node:any) { // TODO how to denote a Ctor return type?
		var ctor:any = node.constructor,
			moduleId:string;
		if (typeof ctor !== 'function') {
			moduleId = ctor.toString();
		}
		return moduleId ? require(moduleId) : ctor;
	}

	static load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void {
		dojotext.load(resourceId, contextRequire, function(template) {
			var ast = Processor.parse(template);
			var dependencies = Processor.scanForDependencies(ast);
			require(dependencies, () => {
				load(function(app:core.IApplication, mediator:core.IMediator) {
					return Processor.widgetFromAst(ast, app, mediator);
				});
			});
		});
	}

	static parse(input:string):any {
		return pegParser.parse(input);
	}

	static scanForDependencies(node:Object):string[] {
		var dependencies:string[] = [];
		function recurse(node:Object) {
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

	static widgetFromAst(node:any, app:any, mediator:any, parent?:widgets.IDomWidget):widgets.IDomWidget {
		// Flattens out an array containing strings and binding objects
		function fillBindingTemplate(items:any[]):string {
			return array.map(items, (item:any) => {
				return item.binding ? mediator.get(item.binding) : item;
			}).join('');
		}

		function observeBindingTemplate(field:string, items:any[]):string {
			for (var i = 0, length = items.length; i < length; ++i) {
				var binding:string = items[i] && items[i].binding;
				if (!binding) {
					continue;
				}
				// TODO: observe multiple keys at once?
				// TODO: where to put these handles?
				mediator.observe(binding, () => {
					widget.set(field, fillBindingTemplate(items));
				});
			}
			return fillBindingTemplate(items);
		}

		var options:any = {},
			key:string,
			items:any,
			WidgetCtor = Processor.getWidgetCtor(node),
			widget:widgets.IDomWidget,
			fieldBindings:{ [key:string]: string; } = {};

		// We have to clean up keys on our node before using them to construct a widget
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
			else if (array.some(items, (item:any) => util.isObject(item) && !item.binding)) {
				// If there are any complex objects that aren't binding also pass through
				// TODO: this is another place we have to dance around complex keys (e.g. Conditional's conditions key)
				options[key] = items;
			}
			else if (items.length === 1 && items[0] && items[0].binding) {
				// Set up field binding when parts is a single element binding descriptor
				fieldBindings[key] = items[0].binding;
			}
			else {
				options[key] = observeBindingTemplate(key, items);

				
			}
		}

		options.app = app;
		if (parent) {
			options.parent = parent;
		}
		else {
			options.mediator = mediator;
		}
		widget = new WidgetCtor(options);

		// TODO: find a way to avoid these post-construction tasks
		if (node.children) {
			widget.set('children', array.map(node.children, (child) => Processor.widgetFromAst(child, app, mediator, widget)));
		}
		// Set up widget bindings after construction
		for (var key in fieldBindings) {
			widget.bind(key, fieldBindings[key], { direction: BindDirection.TWO_WAY });
		}
		return widget;
	}
}

export = Processor;
