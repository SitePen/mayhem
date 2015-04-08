import Base from '../Base';
import { objectToQuery } from 'dojo/io-query';
import PathRegExp from './PathRegExp';
import Request from './Request';
import Router from './Router';

// TODO: Move to util?
function mixWithClonedArrays(target: {}, ...sources: {}[]): {} {
	for (var i = 0, j = sources.length; i < j; ++i) {
		var source: any = sources[i];
		for (var key in source) {
			(<any> target)[key] = Array.isArray(source[key]) ? source[key].slice(0) : source[key];
		}
	}

	return target;
}

// TODO: Move to util?
function mixWithArrayConversion(target: {}, ...sources: {}[]): {} {
	var targetMap: any = target;

	for (var i = 0, j = sources.length; i < j; ++i) {
		var source: any = sources[i];
		for (var key in source) {
			var value = source[key];

			if (key in targetMap) {
				if (!Array.isArray(targetMap[key])) {
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

class UrlRule extends Base {
	protected hostExpression: PathRegExp;
	protected pathExpression: PathRegExp;

	private _defaults: { routeId?: string; };
	get defaults() {
		return this._defaults;
	}
	set defaults(value: {}) {
		this._defaults = value;
		this.host = this.host;
		this.path = this.path;
	}

	private _host: string;
	get host() {
		return this._host;
	}
	set host(value: string) {
		this._host = value;
		this.hostExpression = value
			? this.parsePattern(value, '.', PathRegExp.Direction.RIGHT, false, this.defaults)
			: null;
	}

	private _isCaseSensitive: boolean;
	get isCaseSensitive() {
		return this._isCaseSensitive;
	}
	set isCaseSensitive(value: boolean) {
		this._isCaseSensitive = value;
		this.host = this.host;
		this.path = this.path;
	}

	methods: string[];

	mode: UrlRule.Mode;

	private _path: string;
	get path() {
		return this._path;
	}
	set path(value: string) {
		this._path = value;
		this.pathExpression = value
			? this.parsePattern(value, '/', PathRegExp.Direction.LEFT, this.isCaseSensitive, this.defaults)
			: null;
	}

	protocol: string;

	routeId: string;

	protected initialize() {
		super.initialize();
		this.mode = UrlRule.Mode.PARSE | UrlRule.Mode.SERIALIZE;
	}

	protected parsePattern(pattern: string, separator?: string, separatorDirection?: PathRegExp.Direction, isCaseSensitive?: boolean, defaults?: {}) {
		return new PathRegExp(pattern, separator, separatorDirection, isCaseSensitive, defaults);
	}

	parse(request: Request): Router.RouteInfo {
		if (!(this.mode & UrlRule.Mode.PARSE)) {
			return null;
		}

		if (this.protocol && request.protocol !== this.protocol) {
			return null;
		}

		if (this.methods && this.methods.indexOf(request.method) === -1) {
			return null;
		}

		if (this.hostExpression && !this.hostExpression.test(request.host)) {
			return null;
		}

		var path = request.path && request.path.replace(/^\/*|\/*$/g, '');

		if (this.pathExpression && !this.pathExpression.test(path)) {
			return null;
		}

		var kwArgs: any = {};

		if (this.hostExpression) {
			mixWithArrayConversion(kwArgs, this.hostExpression.exec(request.host));
		}

		if (this.pathExpression) {
			mixWithArrayConversion(kwArgs, this.pathExpression.exec(path));
		}

		// if (request.vars.hasKeys)
		/* tslint:disable:no-unused-variable */
		for (var _ in request.vars) {
			mixWithArrayConversion(kwArgs, request.vars);
			break;
		}
		/* tslint:enable:no-unused-variable */

		var defaults: any = this.defaults;
		for (var key in defaults) {
			if (!(key in kwArgs)) {
				kwArgs[key] = defaults[key];
			}
		}

		var routeInfo: Router.RouteInfo = {
			routeId: kwArgs.routeId || this.routeId,
			kwArgs: kwArgs
		};

		if (!routeInfo.routeId) {
			return null;
		}

		delete kwArgs.routeId;

		return routeInfo;
	}

	serialize(routeId: string, kwArgs?: {}): string {
		if (!(this.mode & UrlRule.Mode.SERIALIZE)) {
			return null;
		}

		// routeId restricts the use of this rule for serialization to a specific route
		if (this.routeId && this.routeId !== routeId) {
			return null;
		}

		var routeInfo: any;

		// The route ID only needs to be provided for serialization when the rule does not know its own route ID
		if (this.routeId) {
			routeInfo = {};
		}
		else {
			routeInfo = { routeId };
		}

		mixWithClonedArrays(routeInfo, this.defaults, kwArgs);

		if (this.hostExpression && !this.hostExpression.testConsumability(routeInfo)) {
			return null;
		}

		if (this.pathExpression && !this.pathExpression.testConsumability(routeInfo)) {
			return null;
		}

		var serialization = '';

		if (this.protocol) {
			if (!this.hostExpression) {
				return null;
			}

			serialization += this.protocol;
		}

		if (this.hostExpression) {
			serialization += '//' + this.hostExpression.consume(routeInfo) + '/';
		}

		if (this.pathExpression) {
			if (!this.hostExpression) {
				serialization += '/';
			}

			serialization += this.pathExpression.consume(routeInfo);
		}

		// if (routeInfo.hasExtraKeys)
		/* tslint:disable:no-unused-variable */
		for (var key in routeInfo) {
			serialization += '?' + objectToQuery(routeInfo);
			break;
		}
		/* tslint:enable:no-unused-variable */

		return serialization;
	}
}

module UrlRule {
	export interface KwArgs extends Base.KwArgs {
		defaults?: {};
		host?: string;
		isCaseSensitive?: boolean;
		path?: string;
		protocol?: string;
		methods?: string[];
		mode?: UrlRule.Mode;
		routeId?: string;
	}

	export enum Mode {
		PARSE = 1,
		SERIALIZE = 2
	}
}

export default UrlRule;
