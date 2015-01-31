import binding = require('../interfaces');
import Binding = require('../Binding');
import esprima = require('esprima');
import util = require('../../util');
import es = esprima.Syntax;

class ObjectMethodBinding<T> extends Binding<T> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		return util.isObject(kwArgs.object) && typeof kwArgs.path === 'string' && kwArgs.path.indexOf('(') > -1;
	}

	private _args:any[];
	private _callee:binding.IBinding<(...args:any[]) => T>;
	private _dependencies:binding.IBinding<any>[];
	private _object:{};

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		var root = this._object = kwArgs.object;
		var path = kwArgs.path;
		var binder = kwArgs.binder;
		var dependencies:binding.IBinding<any>[] = [];

		function createBinding(path:string) {
			var binding = binder.createBinding(root, path);
			dependencies.push(binding);
			return binding;
		}

		function getKey(node:es.Identifier | es.Literal | es.ThisExpression): string {
			switch (node.type) {
				case 'Identifier':
					return (<es.Identifier> node).name;
				case 'Literal':
					return (<es.Literal> node).value;
				case 'ThisExpression':
					return 'this';
				default:
					throw new Error('Unsupported node type "' + node.type + '"');
			}
		}

		function visit(node:es.Node):any {
			if (!node) {
				return undefined;
			}

			switch (node.type) {
				case 'Program':
					if ((<es.Program> node).body.length !== 1) {
						throw new Error('Invalid binding expression');
					}

					return visit((<es.Program> node).body[0]);
				case 'ExpressionStatement':
					return visit((<es.ExpressionStatement> node).expression);
				case 'CallExpression':
					return {
						callee: visit((<es.CallExpression> node).callee),
						args: (<es.CallExpression> node).arguments.map(function (argument:es.Node) {
							return visit(argument);
						})
					};
				case 'MemberExpression':
					return visitMemberExpression(<es.MemberExpression> node);
				case 'Identifier':
					return createBinding((<es.Identifier> node).name);
				case 'Literal':
					return (<es.Literal> node).value;
				case 'ThisExpression':
					return createBinding('this');
				case 'ObjectExpression':
					return visitObjectExpression(<es.ObjectExpression> node);
				case 'ArrayExpression':
					return (<es.ArrayExpression> node).elements.map(function (element:es.Node) {
						return visit(element);
					});
				default:
					throw new Error('Unsupported node type "' + node.type + '"');
			}
		}

		function visitMemberExpression(expression:es.MemberExpression) {
			function visitObject(node:es.MemberExpression | es.Identifier | es.ThisExpression | es.Literal):string {
				switch (node.type) {
					case 'MemberExpression':
						return visitObject((<es.MemberExpression> node).object) + '.' +
							visitObject((<es.MemberExpression> node).property);
					case 'Identifier':
					case 'ThisExpression':
					case 'Literal':
						return getKey(node);
					default:
						throw new Error('Unsupported node type "' + node.type + '"');
				}
			}

			return createBinding(visitObject(expression));
		}

		function visitObjectExpression(expression:es.ObjectExpression):{} {
			var obj:HashMap<any> = {};

			expression.properties.forEach(function (property:es.Property) {
				obj[getKey(property.key)] = visit(property.value);
			});

			return obj;
		}

		var ast:{
			callee:binding.IBinding<(...args:any[]) => T>;
			args:any[];
		} = visit(esprima.parse(path));

		this._dependencies = dependencies;
		this._callee = ast.callee;
		this._args = ast.args;

		var self = this;
		// TODO: Store dependency values when they change to avoid requesting all values every time a call is made
		dependencies.forEach(function (dependency:binding.IBinding<any>) {
			dependency.observe(function () {
				self.notify({ value: self.get() });
			});
		});
	}

	destroy():void {
		super.destroy();

		var dependency:binding.IBinding<any>;
		while ((dependency = this._dependencies.pop())) {
			dependency.destroy();
		}

		this._callee.destroy();

		this._dependencies = this._object = this._callee = this._args = null;
	}

	get():T {
		function readItem(item:any):any {
			if (item instanceof Binding) {
				return item.get();
			}
			else if (typeof item === 'object') {
				return compileObject(item);
			}
			else {
				return item;
			}
		}

		function compileObject(object:any) {
			if (object instanceof Array) {
				return object.map(readItem);
			}
			else if (util.isObject(object)) {
				var compiledObject:HashMap<any> = {};
				for (var key in object) {
					compiledObject[key] = readItem(object[key]);
				}
				return compiledObject;
			}
			else {
				return readItem(object);
			}
		}

		var fn = this._callee.get();

		if (fn) {
			var thisArg = this._callee.getObject();
			var computedArgs = compileObject(this._args);
			return fn.apply(thisArg, computedArgs);
		}

		return undefined;
	}

	getObject():{} {
		return this._object;
	}
}

export = ObjectMethodBinding;
