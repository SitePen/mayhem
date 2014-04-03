/// <reference path="../dojo" />

import Deferred = require('dojo/Deferred');
import dojoText = require('dojo/text');
import has = require('../has');
import templating = require('./interfaces');
import array = require('dojo/_base/array');
import ui = require('../ui/interfaces');
import View = require('./ui/View');
import Widget = require('../ui/Widget');
import WidgetFactory = require('./WidgetFactory');
import when = require('dojo/when');

class Template implements templating.ITemplate {
	static create(tree:templating.IParseTree, CtorOverride?:any):templating.IWidgetConstructor {
		// Dependencies of tree source must already be resolved before creating a template constructor
		return WidgetFactory.getConstructor(tree, CtorOverride);
	}

	static load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void {
		var Loader:templating.ITemplateConstructor = (<any> this).result || this;
		dojoText.load(resourceId, contextRequire, (input:string):void => {
			Loader.process(input).then(load);
		});
	}

	static parse(source:string):templating.IParseTree {
		return new this(source).parse();
	}

	static process(source:any, CtorOverride?:any, timeout?:number):IPromise<templating.IWidgetConstructor> {
		return new this(source).process(CtorOverride, timeout);
	}

	static scan(tree:templating.IParseTree, seedList?:string[]):string[] {
		return new this(tree).scan(seedList);
	}

	Constructor:templating.IWidgetConstructor;
	dependencies:string[];
	parser:templating.IParser;
	scanner:templating.IScanner;
	tree:templating.IParseTree;

	constructor(public source:any) {
		this.tree = this.parse();
		this.dependencies = this.scan();
	}

	create(options?:any):any {
		if (!this.Constructor && has('debug')) {
			console.warn('Dependencies must be loaded before Template can create instances')
		}
		return this.Constructor(options);
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

	parse():templating.IParseTree {
		var source = this.source;
		return typeof source === 'string' ? this.parser.parse(source) : source;
	}

	process(CtorOverride?:any, timeout?:number):IPromise<templating.IWidgetConstructor> {
		console.log('AST: ', this.tree);
		return this._fetch(timeout).then(():templating.IWidgetConstructor => {
			return this.Constructor = Template.create(this.tree, CtorOverride);
		});
	}

	scan(seedList?:string[]):string[] {
		return this.scanner.scan(this.tree, seedList);
	}
}

// Base implementation expects source to be a parse tree
Template.prototype.parser = {
	parse(source:templating.IParseTree):templating.IParseTree {
		return source;
	}
};

// Base implementation scans a parse tree recursively for dependencies
function scan(tree:templating.IParseTree, dependencies:string[] = []):string[] {
	var ctor:any = tree.constructor;
	if (typeof ctor === 'string') {
		// Dependency list has set-like semantics
		dependencies.indexOf(ctor) === -1 && dependencies.push(ctor);
	}
	var children:any = tree.children,
		child:any;
	if (children) {
		for (var i = 0, len = children.length; i < len; ++i) {
			child = children[i];
			if (child && child.hasOwnProperty('constructor')) {
				scan(child, dependencies);
			}
		}
	}
	var kwArgs:any = tree.kwArgs,
		arg:any;
	if (kwArgs) {
		for (var key in kwArgs) {
			arg = kwArgs[key];
			if (arg && arg.hasOwnProperty('constructor')) {
				scan(arg, dependencies);
			}
			else if (arg && arg['$ctor']) {
				scan(arg['$ctor'], dependencies);
			}
		}
	}
	return dependencies;
}

Template.prototype.scanner = { scan: scan };

export = Template;
