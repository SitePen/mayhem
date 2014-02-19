import array = require('dojo/_base/array');
import BindDirection = require('../binding/BindDirection');
import core = require('../interfaces');
import dojotext = require('dojo/text');
import lang = require('dojo/_base/lang');
import pegParser = require('./peg/html');
import widgets = require('../ui/interfaces');
import util = require('../util');

export function load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void {
	dojotext.load(resourceId, contextRequire, function(template:string):void {
		var ast = parse(template);
		var dependencies = scanDependencies(ast);
		require(dependencies, ():void => {
			load(function(app:core.IApplication, mediator:core.IMediator):widgets.IDomWidget {
				return constructWidget(ast, { app: app, mediator: mediator });
			});
		});
	});
}

export function parse(input:string, options:any = {}):any {
	return pegParser.parse(input);
}

// TODO: allow this to be overriden
var defaultModuleId = 'framework/ui/dom/Element';

function scanDependencies(node:Object):string[] {
	var dependencies:string[] = [];
	function recurse(node:Object):void {
		var ctor:any = node.constructor;
		if (typeof ctor !== 'function') {
			if (ctor == null) {
				ctor = defaultModuleId;
			}
			// Parser returns constructors as either string or 1-element string[]
			// Either way toString should do the trick
			var moduleId:string = ctor.toString();
			node.constructor = moduleId;
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

export function constructWidget(node:any, widgetArgs:any = {}):widgets.IDomWidget {
	var key:string,
		items:any,
		WidgetCtor:any = require(node.constructor),
		widget:widgets.IDomWidget,
		fieldBindings:{ [key:string]: string; } = {},
		bindingTemplates:{ [key:string]: any; } = {};

	widgetArgs.app || (widgetArgs.app = widgetArgs.parent.get('app')); // FIXME

	// A little clean up for the keys from our node before we can use them to construct a widget
	for (key in node) {
		items = node[key];
		if (items === undefined) {
			// Treat undefined keys as non-existent
		}
		else if ([ 'constructor', 'app', 'parent', 'mediator' ].indexOf(key) >= 0) {
			// Ignore these keys since we handle them later
		}
		else if (key === 'html') {
			// Don't bother with bindings on html -- Element uses its own mechanism
			widgetArgs[key] = items;
		}
		else if (key === 'children' && node.children && node.children.length) {
			widgetArgs[key] = array.map(node.children, (child:any):widgets.IDomWidget => {
				return constructWidget(child, { app: widgetArgs.app });
			});
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
		else if (items.length === 1 && items[0] && items[0].binding) {
			// Set up field binding when items is a single element binding descriptor
			fieldBindings[key] = items[0].binding;
		}
		else if (array.some(items, (item:any):boolean => item && item.binding)) {
			// If array contains any bindings at all add it as a binding template
			bindingTemplates[key] = items;
		}
		else {
			// Otherwise stringify all keys as they can be string | string[]
			widgetArgs[key] = items.join('');
		}
	}

	widget = new WidgetCtor(widgetArgs);

	function fillBindingTemplate(mediator:core.IMediator, items:any[]):string {
		return array.map(items, (item:any):any => {
			return item.binding ? mediator.get(item.binding) : item;
		}).join('');
	}

	function observeBindingTemplate(mediator:core.IMediator, field:string, items:any[]):IHandle[] {
		var handles:IHandle[] = [];
		for (var i = 0, length = items.length; i < length; ++i) {
			var binding:string = items[i] && items[i].binding;
			if (!binding) {
				continue;
			}
			handles.push(mediator.observe(binding, ():void => {
				widget.set(field, fillBindingTemplate(mediator, items));
			}));
			widget.set(field, fillBindingTemplate(mediator, items));
		}
		return handles;
	}

	var rebind:boolean,
		observerHandles:IHandle[];

	widget.on('remediate', () => { // TODO: IRemediateEvent, so we don't ahve to look up mediator
		var mediator:core.IMediator = widget.get('mediator');
		if (!rebind) { // TODO: this sucks
			rebind = true;
			for (key in fieldBindings) {
				widget.bind(key, fieldBindings[key], { direction: BindDirection.TWO_WAY });
			}
		}
		array.forEach(observerHandles, (handle:IHandle):void => handle.remove());
		observerHandles = [];
		for (key in bindingTemplates) {
			observerHandles = observerHandles.concat(observeBindingTemplate(mediator, key, bindingTemplates[key]));
		}
	});
	// Hook widget's destroy method to tear down our observer handles
	var _destroy:() => void = widget.destroy;
	widget.destroy = ():void => {
		array.forEach(observerHandles, (handle:IHandle):void => handle.remove());
		observerHandles = null;
		_destroy.call(widget);
	};

	return widget;
}
