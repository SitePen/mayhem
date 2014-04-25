/// <reference path="../../dojo.d.ts"/>

var config = {
	modules: {
		router: {
			defaultRoute: 'index',
			controllerPath: 'app/controllers',

			routes: {
				index: {},
				quotes: {
					modules: {
						view: '!Quotes.html',
						model: {
							constructor: '/framework/store/RequestMemory!app/models/Quote',
							target: 'data/quotes.json'
						}
					}
				},
				'quotes/quote': {
					path: '<quoteId:\\d+>',
					modules: {
						view: '!Quote.html',
						store: {
							constructor: '/framework/store/RequestMemory!app/models/Quote',
							target: 'data/quotes.json'
						}
					}
				},
				shipments: {
					modules: {
						view: '!Shipments.html',
						model: {
							constructor: '/framework/store/RequestMemory!app/models/Shipment',
							target: 'data/shipments.json'
						}
					}
				},
				'shipments/shipment': {
					path: '<shipmentId:\\d+>',
					modules: {
						view: '!Shipment.html'
					}
				}
			}
		},
		view: {
			constructor: '!Application.html'
		}
	}
};

export = config;
