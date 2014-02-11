import array = require('dojo/_base/array');
import BindDirection = require('../binding/BindDirection');
import core = require('../interfaces');
import dojotext = require('dojo/text');
import lang = require('dojo/_base/lang');
import pegParser = require('./peg/html');
import widgets = require('../ui/interfaces');
import util = require('../util');

function fillBindingTemplate(mediator:core.IMediator, items:any[]):string {
	return array.map(items, (item:any):any => {
		return item.binding ? mediator.get(item.binding) : item;
	}).join('')
}

function getWidgetCtor(node:any):any { // TODO: how to denote a Ctor return type?
	var ctor:any = node.constructor,
		moduleId:string;
	if (typeof ctor !== 'function') {
		moduleId = ctor.toString();
	}
	return moduleId ? require(moduleId) : ctor;
}

export function load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void {
	dojotext.load(resourceId, contextRequire, function(template:string):void {
		var ast = parse(template);
		var dependencies = scanForDependencies(ast);
		require(dependencies, ():void => {
			load(function(app:core.IApplication, mediator:core.IMediator):widgets.IDomWidget {
				return constructWidget(ast, { app: app, mediator: mediator });
			});
		});
	});
}

export function parse(input:string):any {
	return pegParser.parse(input);
}

function scanForDependencies(node:Object):string[] {
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
			else if (value && typeof value === 'object') {
				recurse(value);
			}
		}
	}
	recurse(node);
	return dependencies;
}

export function constructWidget(node:any, options:{
	app?:core.IApplication;
	mediator?:core.IMediator;
	parent?:widgets.IDomWidget
}):widgets.IDomWidget {
	var mediator:core.IMediator = options.mediator || options.parent.get('mediator'),
		key:string,
		items:any,
		WidgetCtor = getWidgetCtor(node),
		widget:widgets.IDomWidget,
		fieldBindings:{ [key:string]: string; } = {},
		bindingTemplates:{ [key:string]: any; } = {};

	options.app || (options.app = options.parent.get('app'));

	// A little clean up for the keys from our node before we can use them to construct a widget
	for (key in node) {
		items = node[key];
		if (items === undefined) {
			// Treat undefined keys as non-existent
		}
		else if ([ 'constructor', 'children', 'app', 'parent', 'mediator' ].indexOf(key) >= 0) {
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
			// Set up field binding when items is a single element binding descriptor
			fieldBindings[key] = items[0].binding;
		}
		else if (array.some(items, (item:any):boolean => item && item.binding)) {
			// If array contains any bindings at all add it as a binding template
			bindingTemplates[key] = items;
		}
		else {
			// Otherwise stringify all keys as they can be string | string[]
			options[key] = items.join('');
		}
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
				widget.set(field, fillBindingTemplate(widget.get('mediator'), items));
			}));
			widget.set(field, fillBindingTemplate(mediator, items));
		}
		return handles;
	}

	// TODO: find a way to avoid having these tasks be post-construction
	var children:widgets.IDomWidget[],
		observerHandles:IHandle[] = [];
	if (node.children && node.children.length) {
		children = array.map(node.children, (child:any):widgets.IDomWidget => {
			return constructWidget(child, { app: options.app, parent: widget });
		});
		// TODO: find a better way to test for IContainer
		// Set all children on IContainer, just set first child as content on other widgets
		widget.get('children') ? widget.set('children', children) : widget.set('content', children[0]);
	}
	// We need to defer binding setup until after widget construction
	for (key in fieldBindings) {
		// TODO: figure out how to make widget.bind to do the heavy lifting here
		// For now we're just cheating and catching all on* methods and binding directly w/o observing
		if (/^on[A-Z][a-zA-Z]*$/.test(key)) {
			widget.set(key, lang.hitch(mediator, mediator[fieldBindings[key]]));
		}
		else {
			widget.bind(key, fieldBindings[key], { direction: BindDirection.TWO_WAY });
		}
	}
	for (key in bindingTemplates) {
		observerHandles = observerHandles.concat(observeBindingTemplate(key, bindingTemplates[key]));
	}
	// If we have observers we need to hook widget's destroy method to tear down our observer handles
	// TODO: once mediator change propagation is worked out bind to it and update our observers
	if (observerHandles.length) {
		var _destroy:() => void = widget.destroy;
		widget.destroy = function():void {
			array.forEach(observerHandles, (handle:IHandle):void => handle.remove());
			observerHandles = null;
			_destroy.call(widget);
		};
	}
	// TODO: stash observerHandles on widget and make sure they're cleaned up
	return widget;
}
