/// <reference path="../dojo" />

import core = require('../interfaces');
import ui = require('../ui/interfaces');

export interface IParser {
	parse(source:any):IParseTree;
}

export interface IParseTree {
	constructor:string;
	kwArgs?:{ [key:string]: any; };
	children?:IParseTree[];
	content?:any;
}

export interface IScanner {
	scan(tree:IParseTree, seedList?:string[]):string[];
}

export interface ITemplateConstructor extends ILoaderPlugin {
    new(source:any):ITemplate;
    load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void;
    parse(source:string):IParseTree;
	process(source:any, CtorOverride?:any, timeout?:number):IPromise<IWidgetConstructor>;
	scan(tree:IParseTree, seedList?:string[]):string[];
}

export interface ITemplate {
	dependencies:string[];
	source:any; // string | IParseTree
	tree:IParseTree;

	parse():IParseTree;
	process(CtorOverride?:any, timeout?:number):IPromise<IWidgetConstructor>;
	scan():string[];
}

export interface IWidgetConstructor {
	new(options?:any):ui.IWidget;
	(options?:any):ui.IWidget;
}
