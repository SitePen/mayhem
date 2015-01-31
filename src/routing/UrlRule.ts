import arrayUtil = require('dojo/_base/array');
import ioQuery = require('dojo/io-query');
import Observable = require('../Observable');
import PathRegExp = require('./PathRegExp');
import Request = require('./Request');
import Router = require('./Router');

function mixWithClonedArrays(target:{}, ...sources:{}[]):{} {
	for (var i = 0, j = sources.length; i < j; ++i) {
		var source:HashMap<any> = <any> sources[i];
		for (var key in source) {
			(<any> target)[key] = source[key] instanceof Array ? source[key].slice(0) : source[key];
		}
	}

	return target;
}

function mixWithArrayConversion(target:{}, ...sources:{}[]):{} {
	var targetMap:HashMap<any> = <any> target;

	for (var i = 0, j = sources.length; i < j; ++i) {
		var source:HashMap<any> = <any> sources[i];
		for (var key in source) {
			var value = source[key];

			if (key in targetMap) {
				if (!(targetMap[key] instanceof Array)) {
					targetMap[key] = [ targetMap[key] ];
				}

				targetMap[key].push(value);
			}
			else {
				targetMap[key] = value;
			}
		}
	}

	return targetMap;
}

class UrlRule extends Observable {
	get:UrlRule.Getters;
	set:UrlRule.Setters;

	protected _hostExpression:PathRegExp;
	protected _pathExpression:PathRegExp;

	private _defaults:{ routeId?:string; };
	_defaultsGetter() {
		return this._defaults;
	}
	_defaultsSetter(value:{}) {
		this._defaults = value;
		this._hostSetter(this._host);
		this._pathSetter(this._path);
	}

	private _host:string;
	_hostGetter() {
		return this._host;
	}
	_hostSetter(value:string) {
		this._host = value;
		this._hostExpression = value
			? this._parsePattern(value, '.', PathRegExp.Direction.RIGHT, false, this.get('defaults'))
			: null;
	}

	private _isCaseSensitive:boolean;
	_isCaseSensitiveGetter() {
		return this._isCaseSensitive;
	}
	_isCaseSensitiveSetter(value:boolean) {
		this._isCaseSensitive = value;
		this._hostSetter(this._host);
		this._pathSetter(this._path);
	}

	private _path:string;
	_pathGetter() {
		return this._path;
	}
	_pathSetter(value:string) {
		this._path = value;
		this._pathExpression = value
			? this._parsePattern(value, '/', PathRegExp.Direction.LEFT, this.get('isCaseSensitive'), this.get('defaults'))
			: null;
	}

	_initialize() {
		super._initialize();
		this.set('mode', UrlRule.Mode.PARSE | UrlRule.Mode.SERIALIZE);
	}

	protected _parsePattern(pattern:string, separator?:string, separatorDirection?:PathRegExp.Direction, isCaseSensitive?:boolean, defaults?:{}) {
		return new PathRegExp(pattern, separator, separatorDirection, isCaseSensitive, defaults);
	}

	parse(request:Request):Router.RouteInfo {
		if (!(this.get('mode') & UrlRule.Mode.PARSE)) {
			return null;
		}

		if (this.get('protocol') && request.protocol !== this.get('protocol')) {
			return null;
		}

		if (this.get('methods') && arrayUtil.indexOf(this.get('methods'), request.method) === -1) {
			return null;
		}

		if (this._hostExpression && !this._hostExpression.test(request.host)) {
			return null;
		}

		var path = request.path && request.path.replace(/^\/*|\/*$/g, '');

		if (this._pathExpression && !this._pathExpression.test(path)) {
			return null;
		}

		var kwArgs:any = {};

		if (this._hostExpression) {
			mixWithArrayConversion(kwArgs, this._hostExpression.exec(request.host));
		}

		if (this._pathExpression) {
			mixWithArrayConversion(kwArgs, this._pathExpression.exec(path));
		}

		// if (request.vars.hasKeys)
		/* tslint:disable:no-unused-variable */
		for (var _ in request.vars) {
			mixWithArrayConversion(kwArgs, request.vars);
			break;
		}
		/* tslint:enable:no-unused-variable */

		var defaults:HashMap<any> = <any> this.get('defaults');
		for (var key in defaults) {
			if (!(key in kwArgs)) {
				kwArgs[key] = defaults[key];
			}
		}

		var routeInfo:Router.RouteInfo = {
			routeId: kwArgs.routeId || this.get('routeId'),
			kwArgs: kwArgs
		};

		if (!routeInfo.routeId) {
			return null;
		}

		delete kwArgs.routeId;

		return routeInfo;
	}

	serialize(routeId:string, kwArgs?:{}):string {
		if (!(this.get('mode') & UrlRule.Mode.SERIALIZE)) {
			return null;
		}

		// routeId restricts the use of this rule for serialization to a specific route
		if (this.get('routeId') && this.get('routeId') !== routeId) {
			return null;
		}

		var routeInfo:any;

		// The route ID only needs to be provided for serialization when the rule does not know its own route ID
		if (this.get('routeId')) {
			routeInfo = {};
		}
		else {
			routeInfo = { routeId: routeId };
		}

		mixWithClonedArrays(routeInfo, this.get('defaults'), kwArgs);

		if (this._hostExpression && !this._hostExpression.testConsumability(routeInfo)) {
			return null;
		}

		if (this._pathExpression && !this._pathExpression.testConsumability(routeInfo)) {
			return null;
		}

		var serialization = '';

		if (this.get('protocol')) {
			if (!this._hostExpression) {
				return null;
			}

			serialization += this.get('protocol');
		}

		if (this._hostExpression) {
			serialization += '//' + this._hostExpression.consume(routeInfo) + '/';
		}

		if (this._pathExpression) {
			if (!this._hostExpression) {
				serialization += '/';
			}

			serialization += this._pathExpression.consume(routeInfo);
		}

		// if (routeInfo.hasExtraKeys)
		for (var key in routeInfo) {
			serialization += '?' + ioQuery.objectToQuery(routeInfo);
			break;
		}

		return serialization;
	}
}

module UrlRule {
	export interface Getters extends Observable.Getters {
		(key:'defaults'):{};
		(key:'host'):string;
		(key:'isCaseSensitive'):boolean;
		(key:'path'):string;
		(key:'protocol'):string;
		(key:'methods'):string[];
		(key:'mode'):UrlRule.Mode;
		(key:'routeId'):string;
	}

	export enum Mode {
		PARSE = 1,
		SERIALIZE = 2
	}

	export interface Setters extends Observable.Setters {
		(key:'defaults', value:{}):void;
		(key:'host', value:string):void;
		(key:'isCaseSensitive', value:boolean):void;
		(key:'path', value:string):void;
		(key:'protocol', value:string):void;
		(key:'methods', value:string[]):void;
		(key:'mode', value:UrlRule.Mode):void;
		(key:'routeId', value:string):void;
	}
}

export = UrlRule;
