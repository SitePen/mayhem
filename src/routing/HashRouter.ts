import hash = require('dojo/hash');
import ioQuery = require('dojo/io-query');
import lang = require('dojo/_base/lang');
import Promise = require('../Promise');
import Request = require('./Request');
import Router = require('./Router');
import topic = require('dojo/topic');

class HashRouter extends Router {
	protected _handle:IHandle;
	protected _oldHash:string;
	protected _prefix:string;

	get:HashRouter.Getters;
	set:HashRouter.Setters;

	createUrl(routeId:string, kwArgs?:{}):string {
		return '#' + this.get('prefix') + super.createUrl(routeId, kwArgs);
	}

	destroy():void {
		super.destroy();
		this._handle && this._handle.remove();
		this._handle = null;
	}

	go(routeId:string, kwArgs?:{}):Promise<void> {
		var newHash = this.createUrl(routeId, kwArgs).slice(1);

		if (this._oldHash === newHash) {
			return;
		}

		this._handle.remove();
		hash(newHash);
		this._listen();

		return this._handleHashChange(newHash);
	}

	protected _handleHashChange(newHash:string) {
		var prefix = this.get('prefix');

		if (this._oldHash === newHash || (newHash.length && newHash.slice(0, prefix.length) !== prefix)) {
			return;
		}

		if (!newHash && this.get('defaultRoute')) {
			var defaultRoute = this.get('defaultRoute');
			return this.go(defaultRoute.routeId, defaultRoute.kwArgs);
		}

		var self = this;
		var searchIndex = newHash.indexOf('?');

		var request = new Request({
			host: location.host,
			method: 'GET',
			path: newHash.slice(prefix.length, searchIndex > -1 ? searchIndex : Infinity),
			protocol: location.protocol,
			vars: searchIndex > -1 ? ioQuery.queryToObject(newHash.slice(searchIndex + 1)) : {}
		});

		return this._handleRequest(request).then(function () {
			self._oldHash = newHash;
		}, function (error:Error) {
			self._oldHash && hash(self._oldHash, true);
			self.get('app').handleError(error);
		});
	}

	_initialize() {
		super._initialize();
		this._prefix = '!';
	}

	protected _listen() {
		this._handle = topic.subscribe('/dojo/hashchange', lang.hitch(this, '_handleHashChange'));
	}

	run() {
		var self = this;
		this.get('app').run().then(function () {
			self._listen();
			self._handleHashChange(hash());
		});
	}
}

module HashRouter {
	export interface Getters extends Router.Getters {
		(key:'prefix'):string;
	}
	export interface Setters extends Router.Setters {
		(key:'prefix', value:string):void;
	}
}

export = HashRouter;
