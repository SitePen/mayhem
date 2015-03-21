import hash from 'dojo/hash';
import { hitch } from 'dojo/_base/lang';
import { queryToObject } from 'dojo/io-query';
import Promise from '../Promise';
import Request from './Request';
import Router from './Router';
import * as topic from 'dojo/topic';

class HashRouter extends Router {
	protected hashListenerHandle: IHandle;

	protected oldHash: string;

	prefix: string;

	constructor(kwArgs?: HashRouter.KwArgs) {
		super(kwArgs);
	}

	createUrl(routeId: string, kwArgs?: {}): string {
		return '#' + this.prefix + super.createUrl(routeId, kwArgs);
	}

	destroy(): void {
		super.destroy();
		this.hashListenerHandle && this.hashListenerHandle.remove();
		this.hashListenerHandle = null;
	}

	go(routeId: string, kwArgs?: {}): Promise<void> {
		var newHash = this.createUrl(routeId, kwArgs).slice(1);

		if (this.oldHash === newHash) {
			return;
		}

		this.hashListenerHandle.remove();
		hash(newHash);
		this.listen();

		return this.handleHashChange(newHash);
	}

	protected handleHashChange(newHash: string) {
		var prefix = this.prefix;

		if (this.oldHash === newHash || (newHash.length && newHash.slice(0, prefix.length) !== prefix)) {
			return;
		}

		if (!newHash && this.defaultRoute) {
			var defaultRoute = this.defaultRoute;
			return this.go(defaultRoute.routeId, defaultRoute.kwArgs);
		}

		var self = this;
		var searchIndex = newHash.indexOf('?');

		var request = new Request({
			host: location.host,
			method: 'GET',
			path: newHash.slice(prefix.length, searchIndex > -1 ? searchIndex : Infinity),
			protocol: location.protocol,
			vars: searchIndex > -1 ? queryToObject(newHash.slice(searchIndex + 1)) : {}
		});

		return this.handleRequest(request).then(function () {
			self.oldHash = newHash;
		}, function (error: Error) {
			self.oldHash && hash(self.oldHash, true);
			self.app.handleError(error);
		});
	}

	protected initialize(): void {
		super.initialize();
		this.prefix = '!';
	}

	protected listen(): void {
		this.hashListenerHandle = topic.subscribe('/dojo/hashchange', hitch(this, '_handleHashChange'));
	}

	run(): void {
		var self = this;
		this.app.run().then(function () {
			self.listen();
			self.handleHashChange(hash());
		});
	}
}

module HashRouter {
	export interface KwArgs extends Router.KwArgs {
		prefix?: string;
	}
}

export = HashRouter;
