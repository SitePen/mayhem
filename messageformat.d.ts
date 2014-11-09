interface CompileOptions {
	locale?:any /* string | string[] */;
	global?:string;
}

interface Formatters {
	number(defaultOptions?:{ currency?:string; }):NumberFunction;
	date(date:any /* Date | number | string */, locale?:any /* string | string[] */, format?:'full'):string;
	date(date:any /* Date | number | string */, locale?:any /* string | string[] */, format?:'long'):string;
	date(date:any /* Date | number | string */, locale?:any /* string | string[] */, format?:'short'):string;
	date(date:any /* Date | number | string */, locale?:any /* string | string[] */, format?:string):string;
	time(date:any /* Date | number | string */, locale?:any /* string | string[] */, format?:'full'):string;
	time(date:any /* Date | number | string */, locale?:any /* string | string[] */, format?:'long'):string;
	time(date:any /* Date | number | string */, locale?:any /* string | string[] */, format?:'short'):string;
	time(date:any /* Date | number | string */, locale?:any /* string | string[] */, format?:string):string;
}

interface Message<Arguments> {
	(kwArgs?:Arguments):string;
}

interface MessageFactory {
	(global:{}):void;
	():{ [key:string]:Message<any>; };
}

interface NumberFunction {
	(number:number, locale?:any /* string | string[] */, format?:'integer'):string;
	(number:number, locale?:any /* string | string[] */, format?:'percent'):string;
	(number:number, locale?:any /* string | string[] */, format?:'currency'):string;
	(number:number, locale?:any /* string | string[] */, format?:string):string;
}

interface ParseTree {
	type:string;
	program:any;
}

interface PluralFunction {
	(number:number):string;
}

interface Runtime {
	_n:(value:number, offset:number) => number;
	_p:(
		value:string,
		offset:number,
		localeFunction:(number:number, ordinal?:number) => string,
		optionsMap:{ [option:string]:string; },
		ordinal:boolean
	) => string;
	_s:(selectedOption:string, options:{ [option:string]:string; }) => string;
	pf:{ [locale:string]:PluralFunction; };
	fmt:Formatters;
	toString():string;
}

interface JavaScriptString extends String {}

declare class MessageFormat {
	static getPluralFunc(locale:string[]):PluralFunction;
	static _parse(message:string):ParseTree;

	lc:string[];
	runtime:Runtime;
	withIntlSupport:boolean;

	constructor(locale?:string, pluralFunc?:PluralFunction, formatters?:Formatters);
	constructor(locale?:string[], pluralFunc?:PluralFunction, formatters?:Formatters);
	compile<Arguments extends {}>(message:string, options?:CompileOptions):Message<Arguments>;
	compile(message:{ [key:string]:string; }, options?:CompileOptions):MessageFactory;
	_precompile(ast:ParseTree, data?:{ keys:{ [key:number]:string; }; offset:{ [offset:number]:number; }; }):JavaScriptString;
	setIntlSupport(value?:boolean):void;
}

export = MessageFormat;
