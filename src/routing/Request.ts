/// <reference path="../../typings/tsd" />

import ioQuery = require('dojo/io-query');

class Request {
	headers:HashMap<string>;
	host:string;
	method:string;
	path:string;
	protocol:string;
	vars:HashMap<any>;

	constructor(kwArgs?:Request.KwArgs) {
		for (var key in kwArgs) {
			(<any> this)[key] = (<any> kwArgs)[key];
		}
	}

	toString() {
		var serialization = '';

		if (this.method) {
			serialization += this.method + ' ';
		}

		if (this.protocol) {
			serialization += this.protocol;
		}

		if (this.host) {
			serialization += '//' + this.host;
		}

		if (this.path) {
			serialization += this.path;
		}

		// if (this.vars.hasKeys)
		for (var _ in this.vars) {
			serialization += '?' + ioQuery.objectToQuery(this.vars);
			break;
		}

		return '[Request ' + serialization + ']';
	}
}

module Request {
	export interface KwArgs {
		headers?:HashMap<string>;
		host?:string;
		method?:string;
		path?:string;
		protocol?:string;
		vars?:{};
	}
}

export = Request;
