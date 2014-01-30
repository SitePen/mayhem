import pegParser = require('./peg/html');
import core = require('../interfaces');;
import Proxty = require('../Proxty');
import BindDirection = require('../binding/BindDirection');
import widgets = require('../ui/interfaces');
import Widget = require('../ui/Widget');
import util = require('../util');
import array = require('dojo/_base/array');


class Parser {

	static parse(input:string):any {
		return pegParser.parse(input);
	}

	static scanForDependencies(node:Object):string[] {
		var dependencies:string[] = [];
		// TODO: Y U NO LET ME use Object or { [key:string]: any; } typescript?!
		function recurse(node:any) {
			var ctor = node.constructor;
			// Flatt since our parser sets some constructors as arrays
			if (ctor instanceof Array) {
				ctor = ctor.join('');
			}
			// Add to list of dependencies if it's a string module id not already in our dep list
			if (typeof ctor === 'string' && dependencies.indexOf(<string>ctor) === -1) {
				 dependencies.push(ctor);
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

	process(input:string):IPromise<widgets.IWidget> {
		var ast = Parser.parse(input);
		var dependencies:string[] = Parser.scanForDependencies(ast);

		return Widget.fetch(dependencies).then(() => {
			return this.constructWidget(ast);
		});
	}

	private _fillBindingTemplate(items:any[]):string[] {
		return array.map(items, (item:any) => {
			return item.binding ? this.mediator.get(item.binding) : item;
		});
	}

	// TODO node:IAstNode?
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
		// Flatten constructor if it's an array
		if (ctor instanceof Array) {
			ctor = ctor.join('');
		}
		// If ctor isn't already a constructor look up ctor from the dependency map
		// TODO: normalize if ctor is a plugin-based module id
		var WidgetCtor = typeof ctor === 'string' ? require(ctor) : ctor;
		var widget:any /* widgets.IDomWidget */,
			fieldBindings:{ [key:string]: string; } = {},
			proxtyBindings:{ [key:string]: core.IProxty<string>; } = {};

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
					if (!item.binding) return;
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
			// TODO: annoying -- this is still necessary for some reason
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
}

export = Parser;
