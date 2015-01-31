export interface INode {
	[key:string]:any;
	constructor:string;

	// Non-instantiated node
	$ctor?:INode;

	// Element node
	content?:any[];
	children?:INode[];

	// Conditional node
	conditions?:{ condition:{ $bind:string; }; consequent:INode; }[];
}
export interface IParser {
	parse(source:string):IParseTree;
}

export interface IParseTree {
	constructors:string[];
	root:INode;
}
