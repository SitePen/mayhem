import array = require('dojo/_base/array');
import BindDirection = require('../binding/BindDirection');
import core = require('../interfaces');
import dojotext = require('dojo/text');
import lang = require('dojo/_base/lang');
import pegParser = require('./peg/html');
import ui = require('../ui/interfaces');
import util = require('../util');

export var defaults = {
	viewModuleId: 'framework/ui/dom/ViewWidget',
};

export function load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void {
	dojotext.load(resourceId, contextRequire, function(template:string):void {
		var ast = parse(template);
		console.log(ast)
		var dependencies = scanDependencies(ast);
		require(dependencies, ():void => {
			load(function(app?:core.IApplication, mediator?:core.IMediator):ui.IDomWidget {
				return constructWidget(ast, null, { app: app, mediator: mediator });
			});
		});
	});
}

export function parse(input:string, options:any = {}):any {
	return pegParser.parse(input);
}

function scanDependencies(node:Object):string[] {
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

export function constructWidget(node:any, parent:ui.IWidget, widgetArgs:any = {}):ui.IDomWidget {
	var key:string,
		value:any,
		binding:any,
		WidgetCtor:any = require(node.constructor),
		widget:ui.IDomWidget,
		fieldBindings:{ [key:string]: string; } = {},
		bindingTemplates:{ [key:string]: any; } = {};

	if (parent) {
		widgetArgs.app = parent.get('app') || widgetArgs.app // FIXME
	}

	// A little clean up for the keys from our node before we can use them to construct a widget
	for (key in node) {
		value = node[key];
		if ([ 'constructor', 'app', 'mediator' ].indexOf(key) >= 0) {
			// Ignore these keys
		}
		else if (key === 'children' && value) {
			widgetArgs.children = array.map(node.children, (child:any):ui.IDomWidget => {
				return constructWidget(child, null, { app: widgetArgs.app });
			});
		}
		else if (value && value.$bind) {
			binding = value.$bind;
			if (key === 'html') {
				// Pass through binding directly (for now)
				widgetArgs.html = binding;
			}
			else if (typeof binding === 'string') {
				// If binding value is a string it's a field binding
				fieldBindings[key] = binding;	
			}
			else {
				// Otherwise it should be a binding template
				bindingTemplates[key] = binding;
			}
		}
		else {
			// Pass non-binding values to widgetArgs unmolested
			widgetArgs[key] = value;
		}
	}

	widget = new WidgetCtor(widgetArgs);

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

function fillBindingTemplate(mediator:core.IMediator, template:any[]):string {
	return array.map(template, (item:any):any => {
		return item.$bind ? mediator.get(item.$bind) : item;
	}).join('');
}

function observeBindingTemplate(mediator:core.IMediator, template:any[], handler:() => void):IHandle[] {
	var handles:IHandle[] = [];
	for (var i = 0, l = template.length; i < l; ++i) {
		var binding:string = template[i] && template[i].$bind;
		if (!binding) {
			continue;
		}
		handles.push(mediator.observe(binding, handler));
		// Call handler one time to initialize fields with interpreted values
		handler();
	}
	return handles;
}
