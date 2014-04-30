/// <reference path="../../dojo.d.ts"/>

var config:any = {
	modules: {
		router: {
			defaultRoute: 'index',
			controllerPath: 'app/controllers',

			routes: {
				index: {
					controller: null,
					modules: {
						view: '!./Index.html'
					}
				},
				quotes: {
					modules: {
						store: 'quote',
						view: '!./Quotes.html'
					}
				},
				'quotes/quote': {
					path: '<quoteId:\\d+>',
					modules: {
						store: {
							store: 'quote',
							foo: 'shipment'
						},
						view: '!./Quote.html'
					}
				},
				shipments: {
					modules: {
						store: 'shipment',
						view: '!./Shipments.html'
					}
				},
				'shipments/shipment': {
					path: '<shipmentId:\\d+>',
					modules: {
						store: 'shipment',
						view: '!./Shipment.html'
					}
				}
			}
		},
		stores: {
			defaultStore: 'mayhem/store/RequestMemory',
			models: {
				quote: {
					target: 'data/quotes.json'
				},
				shipment: {
					target: 'data/shipments.json'
				}
			}
		},
		view: {
			constructor: '!./Application.html'
		}
	}
};

export = config;
