import DomMaster = require('../ui/dom/Master');
import domUtil = require('../ui/dom/util');
import ioQuery = require('dojo/io-query');
import Request = require('./Request');
import Router = require('./Router');
import util = require('../util');
import WebApplication = require('../WebApplication');

var parser:HTMLAnchorElement = document.createElement('a');

function createLocation(link:HTMLAnchorElement) {
	return {
		host: link.host,
		href: link.href,
		pathname: link.pathname,
		protocol: link.protocol,
		search: link.search
	};
}

function matchesCurrentOrigin(target:HTMLAnchorElement) {
	return target.protocol + '//' + target.host === location.protocol + '//' + location.host;
}

interface Location {
	host:string;
	href:string;
	pathname:string;
	protocol:string;
	search:string;
}

class HtmlHistoryRouter extends Router {
	protected _handle:IHandle;
	protected _oldLocation:Location;
	protected _uiHandle:IHandle;

	get:HtmlHistoryRouter.Getters;
	set:HtmlHistoryRouter.Setters;

	destroy():void {
		super.destroy();
		this._handle && this._handle.remove();
		this._uiHandle && this._uiHandle.remove();
		this._handle = this._uiHandle = null;
	}

	go(routeId:string, kwArgs?:{}) {
		var newUrl = this.createUrl(routeId, kwArgs);

		if (this._oldLocation && this._oldLocation.href === newUrl) {
			return;
		}

		parser.href = newUrl;
		var newLocation:Location = createLocation(parser);

		history.pushState(newLocation, null, newUrl);
		return this._handleHistoryChange(newLocation);
	}

	protected _handleHistoryChange(newLocation:Location) {
		if (this._oldLocation && this._oldLocation.href === newLocation.href) {
			return;
		}

		var self = this;

		var request = new Request({
			host: newLocation.host,
			method: 'GET',
			path: newLocation.pathname,
			protocol: newLocation.protocol,
			vars: ioQuery.queryToObject(newLocation.search.slice(1))
		});

		return this._handleRequest(request).then(function () {
			self._oldLocation = newLocation;
		}, function (error:Error) {
			self._oldLocation && history.replaceState(self._oldLocation, null, self._oldLocation.href);
			self.get('app').handleError(error);
		});
	}

	protected _retargetLinkCapture(root:Element) {
		var self = this;

		// TODO: Use native event manager to enable fast click everywhere
		this._uiHandle && this._uiHandle.remove();
		this._uiHandle = domUtil.on(root, 'click', function (event:MouseEvent) {
			var target:HTMLAnchorElement = <any> event.target;
			do {
				if (target.nodeName.toUpperCase() === 'A' && target.href && matchesCurrentOrigin(target)) {
					event.preventDefault();
					self._handleHistoryChange(createLocation(target));
					return;
				}
			} while ((target = <any> target.parentNode));
		});
	}

	run() {
		var self = this;
		var ui:DomMaster = <any> this.get('app').get('ui');
		this._handle = util.createCompositeHandle(
			domUtil.on(window, 'popstate', function (event:PopStateEvent) {
				self._handleHistoryChange(event.state);
			}),
			ui.observe('root', function (change) {
				self._retargetLinkCapture(change.value);
			})
		);

		this._retargetLinkCapture(ui.get('root'));

		this.get('app').run().then(function () {
			self._handleHistoryChange(history.state || location);
		});
	}
}

module HtmlHistoryRouter {
	export interface Getters extends Router.Getters {
		(key:'app'):WebApplication;
	}
	export interface Setters extends Router.Setters {}
}

export = Router;
