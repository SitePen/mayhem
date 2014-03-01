import Deferred = require('dojo/Deferred');
import DomWidgetFactory = require('./DomWidgetFactory');
import templating = require('./interfaces');
import when = require('dojo/when');

// The base Template class has no _parser so it can only be used with raw parse trees
class Template implements templating.ITemplate {
	static parse(source:string):templating.IParseTree {
		return new this(source).parse();
	}

	// Scans a parse tree recursively for dependencies
	static scan(tree:templating.IParseTree, dependencies:string[] = []):string[] {
		var ctor:any = tree.constructor;
		if (typeof ctor !== 'string') {
			throw new Error('Widget constructor must be a string');
		}
		// Dependency list has set semantics
		dependencies.indexOf(ctor) === -1 && dependencies.push(ctor);
		var children:any = tree.children,
			child:any;
		if (children) {
			for (var i = 0, len = children.length; i < len; ++i) {
				child = children[i];
				if (child && typeof child.constructor == 'string') {
					Template.scan(child, dependencies);
				}
			}
		}
		var kwArgs:any = tree.kwArgs,
			value:any;
		if (kwArgs) {
			for (var key in kwArgs) {
				value = kwArgs[key];
				if (value && typeof value.constructor === 'string') {
					Template.scan(value, dependencies);
				}
			}
		}
		return dependencies;
	}

	dependencies:string[];
	factory:DomWidgetFactory;
	source:any;
	tree:templating.IParseTree;

	constructor(source:any) {
		this.source = source;
		this.tree = this.parse();
		this.dependencies = this.scan();
	}

	private _fetch(timeout?:number):IPromise<void> {
		var dfd:IDeferred<void> = new Deferred<void>(),
			timeoutHandle:number;
		require(this.dependencies, ():void => {
			clearTimeout(timeoutHandle);
			dfd.resolve(undefined);
		});
		if (timeout) {
			timeoutHandle = setTimeout(():void => {
				dfd.reject(new Error('Timed out while loading template dependencies'));
			});
		}
		return dfd;
	}

	load(timeout?:number):IPromise<templating.IWidgetFactory> {
		console.log('AST: ', this.tree)
		return this._fetch(timeout).then(():templating.IWidgetFactory => {
			return this.factory = new DomWidgetFactory(this.tree);
		});
	}

	parse():templating.IParseTree {
		// Base implementation expects source to be a parse tree
		return this.tree;
	}

	scan():string[] {
		return Template.scan(this.tree);
	}
}

export = Template;
