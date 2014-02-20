import array = require('dojo/_base/array');
import BindDirection = require('../binding/BindDirection');
import core = require('../interfaces');
import dojotext = require('dojo/text');
import lang = require('dojo/_base/lang');
import pegParser = require('./peg/html');
import widgets = require('../ui/interfaces');
import util = require('../util');

export var options = {
	defaultModuleId: 'framework/ui/dom/Element'
};

export function load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void {
	dojotext.load(resourceId, contextRequire, function(template:string):void {
		var ast = parse(template);
		console.log(ast)
		var dependencies = scanDependencies(ast);
		require(dependencies, ():void => {
			load(function(app?:core.IApplication, mediator?:core.IMediator):widgets.IDomWidget {
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
	function recurse(node:Object):void {
		var ctor:any = node.constructor;
		if (typeof ctor !== 'function') {
			if (ctor == null) {
				ctor = options.defaultModuleId;
			}
			// Parser returns constructors as either string or 1-element string[]
			// Either way toString should do the trick
			var moduleId:string = ctor.toString();
			node['constructor'] = moduleId;
			// Add to list of dependencies if not already in our dep list
			dependencies.indexOf(moduleId) === -1 && dependencies.push(moduleId);
		}
		var key:string,
			value:any;
		// TODO: once we simplify our ast we can just walk children
		for (key in node) {
			value = node[key];
			if (value instanceof Array) {
				array.forEach(value, recurse);
			}
			else if (value && typeof value === 'object') {
				recurse(value);
			}
		}
	}
	recurse(node);
	return dependencies;
}

export function constructWidget(node:any, parent:widgets.IWidget, widgetArgs:any = {}):widgets.IDomWidget {
	var key:string,
		items:any,
		WidgetCtor:any = require(node.constructor),
		widget:widgets.IDomWidget,
		fieldBindings:{ [key:string]: string; } = {},
		bindingTemplates:{ [key:string]: any; } = {};

	if (parent) {
		widgetArgs.app = parent.get('app') || widgetArgs.app // FIXME
	}

	// A little clean up for the keys from our node before we can use them to construct a widget
	for (key in node) {
		items = node[key];
		if (items === undefined) {
			// Treat undefined keys as non-existent
		}
		else if ([ 'constructor', 'app', 'mediator' ].indexOf(key) >= 0) {
			// Ignore these keys
		}
		else if (key === 'children' && node.children && node.children.length) {
			widgetArgs[key] = array.map(node.children, (child:any):widgets.IDomWidget => {
				return constructWidget(child, null, { app: widgetArgs.app });
			});
		}
		else if (key === 'html') {
			// Pass through unmolested
			widgetArgs[key] = items;
		}
		else if (items.binding) {
			// If items is an object with a binding key it's a field binding
			fieldBindings[key] = items.binding;
		}
		else if (!(items instanceof Array)) {
			// Pass non-array items through to widgetArgs unmolested
			widgetArgs[key] = items;
		}
		else if (array.some(items, (item:any):boolean => util.isObject(item) && !item.binding)) {
			// If there are any complex objects that aren't binding also pass through
			// TODO: this is another place we have to dance around complex keys (e.g. Conditional's conditions key)
			widgetArgs[key] = items;
		}
		else {
			// Otherwise items should be a binding template
			bindingTemplates[key] = items;
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
		return item.binding ? mediator.get(item.binding) : item;
	}).join('');
}

function observeBindingTemplate(mediator:core.IMediator, template:any[], handler:() => void):IHandle[] {
	var handles:IHandle[] = [];
	for (var i = 0, l = template.length; i < l; ++i) {
		var binding:string = template[i] && template[i].binding;
		if (!binding) {
			continue;
		}
		handles.push(mediator.observe(binding, handler));
		// Call handler one time to initialize fields with interpreted values
		handler();
	}
	return handles;
}
