/// <reference path="../intern.d.ts" />

import Deferred = require('intern/dojo/Deferred');
import generator = require('intern/dojo/node!yeoman-generator');
import lang = require('intern/dojo/lang');
import path = require('intern/dojo/node!path');
import rimraf = require('intern/dojo/node!rimraf');

var helpers = generator.test;

function createTestFunction(run:(clean?:boolean) => generator.IRunContext):GeneratorTester.ITestFunction {
	var args:string[];
	var callback:Function;
	var resolve:boolean = true;
	var generators:string[];
	var options:any;
	var prompts:any;

	var func:GeneratorTester.ITestFunction = <any> function ():any {
		var dfd = this.async();
		var context = run();

		if (args) {
			context.withArguments(args);
		}
		if (options) {
			context.withOptions(options);
		}
		if (generators) {
			context.withGenerators(generators);
		}
		if (prompts) {
			context.withPrompts(prompts);
		}

		var self = lang.delegate(this, {
			async: function ():IDeferred<any> {
				resolve = false;
				return dfd;
			}
		});
		context.on('end', function ():void {
			if (!callback) {
				dfd.resolve(undefined);
				return;
			}

			try {
				callback.call(self);
				resolve && dfd.resolve(undefined);
			}
			catch (e) {
				dfd.reject(e);
			}
		});
	};

	func.then = function (_callback:Function):GeneratorTester.ITestFunction {
		callback = _callback;
		return func;
	};

	func.withArguments = function (_args:string[]):GeneratorTester.ITestFunction {
		if (args) {
			args = args.concat(_args);
		}
		else {
			args = _args;
		}

		return func;
	};
	func.withGenerators = function (_generators:string[]):GeneratorTester.ITestFunction {
		if (generators) {
			generators = generators.concat(_generators);
		}
		else {
			generators = _generators;
		}

		return func;
	};

	func.withOptions = function (_options:any):GeneratorTester.ITestFunction {
		options = lang.mixin(options || {}, _options);
		return func;
	};
	func.withPrompts = function (_prompts:any):GeneratorTester.ITestFunction {
		prompts = lang.mixin(prompts || {}, _prompts);
		return func;
	};

	return func;
}

class GeneratorTester {
	protected require:GeneratorTester.IRequire;
	protected path:string;
	protected tempPath:string;

	constructor(kwArgs:any) {
		lang.mixin(this, kwArgs);

		var dirname = this.require.toUrl('./');
		console.log('DIRNAME:', dirname);
		console.log('PATH:', this.path);
		this.path = path.resolve(dirname, this.path);
		this.tempPath = path.join(dirname, 'temp');

		this.clean = this.clean.bind(this);
	}

	clean():IPromise<void> {
		var dfd = new Deferred<void>();

		// Make sure we're not deleting CWD by moving to the temp directory's
		// parent directory
		process.chdir(path.dirname(this.tempPath));

		// Clean up the temp directory after everything is done
		rimraf(this.tempPath, function (err:Error):void {
			if (err) {
				dfd.reject(err);
				return;
			}

			dfd.resolve(undefined);
		});

		return dfd.promise;
	}

	run(clean:boolean = true):generator.IRunContext {
		var context = helpers.run(this.path);

		if (clean) {
			context = context.inDir(this.tempPath);
		}

		return context;
	}

	withArguments(args:any):GeneratorTester.ITestFunction {
		return createTestFunction(this.run.bind(this)).withArguments(args);
	}

	withGenerators(dependencies:string[]):GeneratorTester.ITestFunction {
		return createTestFunction(this.run.bind(this)).withGenerators(dependencies);
	}

	withOptions(options:any):GeneratorTester.ITestFunction {
		return createTestFunction(this.run.bind(this)).withOptions(options);
	}

	withPrompts(answers:any):GeneratorTester.ITestFunction {
		return createTestFunction(this.run.bind(this)).withPrompts(answers);
	}
}

module GeneratorTester {
	export interface IRequire {
		(moduleId:string):any;
		toUrl(moduleId:string):string;
	}

	export interface ITestFunction {
		():void;
		then(callback:Function):ITestFunction;
		withArguments(args:string[]):ITestFunction;
		withGenerators(dependencies:string[]):ITestFunction;
		withOptions(options:any):ITestFunction;
		withPrompts(answers:any):ITestFunction;
	}
}

export = GeneratorTester;
