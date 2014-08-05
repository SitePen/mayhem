/// <reference path="../dojo" />

export interface IParser {
	parse(source:string):IParseTree;
}

export interface IParseTree {
	constructors:string[];
	root:{
		[key:string]:any;
		constructor:string;
	};
}
