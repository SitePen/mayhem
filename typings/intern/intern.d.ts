/// <reference path="../chai/chai.d.ts" />
/// <reference path="../chai/chai-assert.d.ts" />
/// <reference path="../dojo/dojo.d.ts" />

declare module 'intern' {
	import main = require('intern/main');
	export = main;
}

declare module 'intern/main' {
	export interface Config {
		capabilities?:{ [key:string]:any; };
		environments?:{ [key:string]:any; }[];
		excludeInstrumentation?:RegExp;
		functionalSuites?:string[];
		grep?:RegExp;
		loader?:{
			[key:string]:any;
			baseUrl?:string;
			packages?:any[];
			map?:{ [key:string]:{ [key:string]:string; }; };
		};
		maxConcurrency?:number;
		proxyPort?:number;
		proxyUrl?:string;
		reporters?:string[];
		suites?:string[];
		tunnel?:string;
		tunnelOptions?:{ [key:string]:any; };
		useLoader?:{
			'host-browser'?:string;
			'host-node'?:string;
		};
	}

	export interface Deferred<T> extends IDeferred<T> {
		callback<U>(callback:U):U;
		rejectOnError<U>(callback:U):U;
	}

	export var args:any;
	export var mode:string;
	export var config:Config;
	export var maxConcurrency:number;
	export var suites:any[];
	export var tunnel:any;
	export var grep:RegExp;
	export function run():IPromise<void>;
}

declare module 'intern!object' {
	var createSuite:{
		(definition:{ [key:string]:any; }):void;
		(definition:() => { [key:string]:any; }):void;
	};
	export = createSuite;
}

declare module 'intern!tdd' {
	var tdd:{
		after(fn:() => any):void;
		afterEach(fn:() => any):void;
		before(fn:() => any):void;
		beforeEach(fn:() => any):void;
		suite(name:string, factory:() => void):void;
		test(name:string, test:() => any):void;
	};
	export = tdd;
}

declare module 'intern/chai!assert' {
	var assert:chai.Assert;
	export = assert;
}

declare module 'intern/dojo/has' {
	function has(name:string):any;
	export = has;
}
