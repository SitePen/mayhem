import { createCompositeHandle } from '../util';
import DomMaster from '../ui/dom/Master';
import { on } from '../ui/dom/util';
import { queryToObject } from 'dojo/io-query';
import Request from './Request';
import Router from './Router';
import WebApplication from '../WebApplication';

var parser: HTMLAnchorElement = document.createElement('a');

function createLocation(link: HTMLAnchorElement) {
	return {
		host: link.host,
		href: link.href,
		pathname: link.pathname,
		protocol: link.protocol,
		search: link.search
	};
}

function matchesCurrentOrigin(target: HTMLAnchorElement) {
	return target.protocol + '//' + target.host === location.protocol + '//' + location.host;
}

interface Location {
	host: string;
	href: string;
	pathname: string;
	protocol: string;
	search: string;
}

class HtmlHistoryRouter extends Router {
	app: WebApplication;
	protected handle: IHandle;
	protected oldLocation: Location;
	protected uiHandle: IHandle;

	destroy(): void {
		super.destroy();
		this.handle && this.handle.remove();
		this.uiHandle && this.uiHandle.remove();
		this.handle = this.uiHandle = null;
	}

	go(routeId: string, kwArgs?: {}) {
		var newUrl = this.createUrl(routeId, kwArgs);

		if (this.oldLocation && this.oldLocation.href === newUrl) {
			return;
		}

		parser.href = newUrl;
		var newLocation: Location = createLocation(parser);

		history.pushState(newLocation, null, newUrl);
		return this.handleHistoryChange(newLocation);
	}

	protected handleHistoryChange(newLocation: Location) {
		if (this.oldLocation && this.oldLocation.href === newLocation.href) {
			return;
		}

		var self = this;

		var request = new Request({
			host: newLocation.host,
			method: 'GET',
			path: newLocation.pathname,
			protocol: newLocation.protocol,
			vars: queryToObject(newLocation.search.slice(1))
		});

		return this.handleRequest(request).then(function () {
			self.oldLocation = newLocation;
		}, function (error: Error) {
			self.oldLocation && history.replaceState(self.oldLocation, null, self.oldLocation.href);
			self.app.handleError(error);
		});
	}

	protected retargetLinkCapture(root: Element): void {
		var self = this;

		// TODO: Use native event manager to enable fast click everywhere
		this.uiHandle && this.uiHandle.remove();
		this.uiHandle = on(root, 'click', function (event: MouseEvent) {
			var target = <HTMLAnchorElement> event.target;
			do {
				if (target.nodeName.toUpperCase() === 'A' && target.href && matchesCurrentOrigin(target)) {
					event.preventDefault();
					self.handleHistoryChange(createLocation(target));
					return;
				}
			} while ((target = <HTMLAnchorElement> target.parentNode));
		});
	}

	run(): void {
		var self = this;
		var ui = <DomMaster> this.app.ui;
		this.handle = createCompositeHandle(
			on(window, 'popstate', function (event: PopStateEvent) {
				self.handleHistoryChange(event.state);
			}),
			ui.observe('root', function (change) {
				self.retargetLinkCapture(change.value);
			})
		);

		this.retargetLinkCapture(ui.get('root'));

		this.app.run().then(function () {
			self.handleHistoryChange(history.state || location);
		});
	}
}

export = HtmlHistoryRouter;
