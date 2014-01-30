import array = require('dojo/_base/array');
import BindDirection = require('../binding/BindDirection');
import core = require('../interfaces');
import Deferred = require('dojo/Deferred');
import pegParser = require('./peg/html');
import Widget = require('../ui/Widget');
import widgets = require('../ui/interfaces');
import util = require('../util');

class Parser {

	// TODO: dependency loading failure will hang, but a timeout seems hacky
	static fetch(dependencies:string[]):IPromise<void> {
		var dfd:IDeferred<void> = new Deferred<void>();
		require(dependencies, () => {
			dfd.resolve(undefined);
		});
		return dfd.promise;
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
				var mid:string = ctor.toString();
				// Add to list of dependencies if it's a string module id not already in our dep list
				dependencies.indexOf(mid) === -1 && dependencies.push(mid);
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

	app:core.IApplication;
	mediator:core.IMediator;
	input:string;
	ast:any;

	constructor(kwArgs:any) {
		this.app = kwArgs.app;
		this.mediator = kwArgs.mediator;
	}

	constructWidget(node:any, parent?:widgets.IWidget):widgets.IWidget {
		var options:any = {},
			children:any,
			html:any;

		// We handle html and children special after widget insantiation
		if (node.children) {
			children = node.children;
			node.children = undefined;
		}
		if (node.html) {
			var html = node.html;
			node.html = undefined;
		}

		var ctor:any = node.constructor;
		// Set constructor on node to undefined so we ignore it
		// TODO: find a better way to do that avoids mutating the tree (helpful for debugging)
		node.constructor = undefined;
		var mid:string;
		if (typeof ctor !== 'function') {
			mid = ctor.toString()
		}
		// TODO: normalize if mid is plugin-based?
		var WidgetCtor = mid ? require(mid) : ctor,
			widget:widgets.IDomWidget,
			fieldBindings:{ [key:string]: string; } = {};

		var key:string,
			items:any;
		for (key in node) {
			items = node[key];
			if (items === undefined) {
				// Ignore undefined keys
			}
			else if (!(items instanceof Array)) {
				// Pass non-array items through to options unmolested
				options[key] = items;
			}
			else if (items[0] && items[0].binding) {
				// Set up field binding when parts is a single element binding descriptor
				fieldBindings[key] = items[0].binding;
			}
			else {
				options[key] = this._fillBindingTemplate(items);
				array.forEach(items, (item:any) => {
					if (!item.binding) {
						return;
					}
					// TODO: observe multiple keys at once?
					// TODO: where to put these handles?
					this.mediator.observe(item.binding, () => {
						// TODO: delay this to be sure this is after widget construction
						widget.set(this._fillBindingTemplate(items));
					});
				});
			}
		}

		options.parser = this;
		options.app = this.app;
		if (parent) {
			options.parent = parent;
			// TODO: annoying but this is still necessary for some reason
			// (could be because we're not consistently passing in parent refs, breaking mediator lookup)
			options.mediator = this.mediator;
		}
		else {
			options.mediator = this.mediator;
		}
		widget = new WidgetCtor(options);

		if (html) {
			widget.set('html', html);
		}
		if (children) {
			// TODO move this to Element
			widget.set('children', array.map(children, (child) => this.constructWidget(child, widget)));
		}

		// Set up widget bindings after construction
		for (var key in fieldBindings) {
			widget.bind(key, fieldBindings[key], { direction: BindDirection.TWO_WAY });
		}
		return widget;
	}

	private _fillBindingTemplate(items:any[]):string[] {
		return array.map(items, (item:any) => {
			return item.binding ? this.mediator.get(item.binding) : item;
		});
	}

	process(input:string):IPromise<widgets.IWidget> {
		var ast = Parser.parse(input);
		var dependencies:string[] = Parser.scanForDependencies(ast);

		return Parser.fetch(dependencies).then(() => {
			return this.constructWidget(ast);
		});
	}
}

export = Parser;
