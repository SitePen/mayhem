declare module 'framework/templating/peg/html' {
	var parser:{
		parse(input:string):any; // AST
	};
	export = parser;
}