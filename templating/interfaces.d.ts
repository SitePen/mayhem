/// <reference path="../dojo" />

import ui = require('../ui/interfaces');

export interface IParser {
	parse(source:string):IParseTree;
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

export interface ITemplateLoader {
    new(source:any):ITemplate;
    load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void;
    parse(source:string):IParseTree;
	process(source:any, timeout?:number):IPromise<IWidgetFactory>;
	scan(tree:IParseTree, seedList?:string[]):string[];
}

export interface ITemplate {
	dependencies:string[];
	factory:IWidgetFactory;
	source:any; // string | IParseTree
	tree:IParseTree;

	load(timeout?:number):IPromise<IWidgetFactory>;
	parse():IParseTree;
	scan():string[];
}

export interface IWidgetFactory {
	create(options?:any):ui.IWidget;
	destroy():void;
}
