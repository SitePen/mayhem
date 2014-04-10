/// <reference path="../dojo" />

import Deferred = require('dojo/Deferred');
import dojoText = require('dojo/text');
import templating = require('./interfaces');
import array = require('dojo/_base/array');
import ui = require('../ui/interfaces');
import View = require('./ui/View');
import Widget = require('../ui/Widget');
import WidgetFactory = require('./WidgetFactory');
import when = require('dojo/when');

class Template implements templating.ITemplate {
	static load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void {
		var Loader:templating.ITemplateConstructor = (<any> this).result || this;
		dojoText.load(resourceId, contextRequire, (input:string):void => {
			Loader.process(input).then(load);
		});
	}

	static parse(source:string):templating.IParseTree {
		return new this(source).parse();
	}

	static process(source:any, timeout?:number):IPromise<templating.IWidgetConstructor> {
		return new this(source).load(timeout);
	}

	static scan(tree:templating.IParseTree, seedList?:string[]):string[] {
		return new this(tree).scan(seedList);
	}

	dependencies:string[];
	parser:templating.IParser;
	scanner:templating.IScanner;
	tree:templating.IParseTree;
	private _WidgetConstructor:templating.IWidgetConstructor;

	constructor(public source:any) {
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

	load(timeout?:number):IPromise<templating.IWidgetConstructor> {
		console.log('AST: ', this.tree);
		return this._fetch(timeout).then(():templating.IWidgetConstructor => {
			return this._WidgetConstructor = this.createConstructor();
		});
	}

	parse():templating.IParseTree {
		var source = this.source;
		return typeof source === 'string' ? this.parser.parse(source) : source;
	}

	scan(seedList?:string[]):string[] {
		return this.scanner.scan(this.tree, seedList);
	}

	create(options?:any):any {
		if (!this._WidgetConstructor) {
			throw new Error('Dependencies must be loaded before Template can create instances')
		}
		return this._WidgetConstructor(options);
	}

	createConstructor():templating.IWidgetConstructor {
		var factory = new WidgetFactory(this.tree);
		return <templating.IWidgetConstructor> function(options?:any):ui.IWidget {
			return factory.create(options);
		}
	}
}

// Base implementation expects source to be a parse tree
Template.prototype.parser = {
	parse(source:templating.IParseTree):templating.IParseTree {
		return source;
	}
}

// Base implementatino scans a parse tree recursively for dependencies
Template.prototype.scanner = {
	scan(tree:templating.IParseTree, dependencies:string[] = []):string[] {
		function hasDependency(value:templating.IParseTree):boolean {
			return value && typeof value.constructor === 'string';
		}

		if (hasDependency(tree)) {
			var ctor:any = tree.constructor;
			// Dependency list has set semantics
			array.indexOf(dependencies, ctor) === -1 && dependencies.push(ctor);
		}
		var children:any = tree.children,
			child:any;
		if (children) {
			for (var i = 0, len = children.length; i < len; ++i) {
				child = children[i];
				if (hasDependency(child)) {
					Template.scan(child, dependencies);
				}
			}
		}
		var kwArgs:any = tree.kwArgs,
			arg:any;
		if (kwArgs) {
			for (var key in kwArgs) {
				arg = kwArgs[key];
				if (hasDependency(arg)) {
					Template.scan(arg, dependencies);
				}
			}
		}
		return dependencies;
	}
}

export = Template;
