/// <reference path="../dojo" />

import ui = require('../ui/interfaces');

export interface IParseTree {
	constructor:string;
	kwArgs?:{ [key:string]: any; };
	children?:IParseTree[];
	content?:any;
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
