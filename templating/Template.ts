import Deferred = require('dojo/Deferred');
import dojoText = require('dojo/text');
import WidgetFactory = require('./WidgetFactory');
import templating = require('./interfaces');
import when = require('dojo/when');

// The base Template class has a noop parse method so it expects source to be a parse tree object
class Template implements templating.ITemplate {
	static load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void {
		var Loader:templating.ITemplateConstructor = (<any> this).result;
		dojoText.load(resourceId, contextRequire, (input:string):void => {
			Loader.process(input).then(load);
		});
	}

	static parse(source:string):templating.IParseTree {
		return new this(source).parse();
	}

	static process(source:any, timeout?:number):IPromise<templating.IWidgetFactory> {
		return new this(source).load(timeout);
	}

	static scan(tree:templating.IParseTree, seedList?:string[]):string[] {
		return new this(tree).scan(seedList);
	}

	dependencies:string[];
	factory:WidgetFactory; // TODO: ViewConstructor?
	parser:templating.IParser;
	scanner:templating.IScanner;
	source:any; // string | templating.IParseTree
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
			}, timeout);
		}
		return dfd;
	}

	load(timeout?:number):IPromise<templating.IWidgetFactory> {
		console.log('AST: ', this.tree)
		return this._fetch(timeout).then(():templating.IWidgetFactory => {
			return this.factory = new WidgetFactory(this.tree);
		});
	}

	parse():templating.IParseTree {
		var source = this.source;
		return typeof source === 'string' ? this.parser.parse(source) : source;
	}

	scan(seedList?:string[]):string[] {
		return this.scanner.scan(this.tree, seedList);
	}
}

// Base implementation expects source to be a parse tree or string representing a parse tree
Template.prototype.parser = {
	parse(source:string):templating.IParseTree {
		return (<any> require).eval('(' + source + ')');
	}
}

// Base implementatino scans a parse tree recursively for dependencies
Template.prototype.scanner = {
	scan(tree:templating.IParseTree, dependencies:string[] = []):string[] {
		function hasConstructor(value:templating.IParseTree):boolean {
			return value && typeof value.constructor === 'string';
		}

		if (hasConstructor(tree)) {
			var ctor:any = tree.constructor;
			// Dependency list has set semantics
			dependencies.indexOf(ctor) === -1 && dependencies.push(ctor);
		}
		var children:any = tree.children,
			child:any;
		if (children) {
			for (var i = 0, len = children.length; i < len; ++i) {
				child = children[i];
				if (hasConstructor(child)) {
					Template.scan(child, dependencies);
				}
			}
		}
		var kwArgs:any = tree.kwArgs,
			arg:any;
		if (kwArgs) {
			for (var key in kwArgs) {
				arg = kwArgs[key];
				if (hasConstructor(arg)) {
					Template.scan(arg, dependencies);
				}
			}
		}
		return dependencies;
	}
}

export = Template;
