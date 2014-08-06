/// <reference path="../dojo" />

export interface INode {
	[key:string]:any;
	constructor:string;
	$ctor?:INode;
}
export interface IParser {
	parse(source:string):IParseTree;
}

export interface IParseTree {
	constructors:string[];
	root:INode;
}
