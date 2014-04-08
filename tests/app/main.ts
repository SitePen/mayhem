import WebApplication = require('framework/WebApplication');

var app = new WebApplication({
	modules: {
		router: {
			mediatorPath: 'app/mediators',
			viewPath: 'framework/templating/html!app/views',
			defaultRoute: 'items',

			routes: {
				items: {
					view: 'Items',
					collections: {
						itemsStore: 'items'
					}
				},
				'items/item': {
					view: 'Item',
					collections: {
						'itemStore': 'items'
					},
					path: '<itemId:\\d+>'
				}
			}
		},
		collections: {
			defaultStore: 'framework/store/RequestMemory',
			modelPath: 'app/models',
			models: {
				items: {
					model: 'Item',
					target: require.toUrl('app/data/items.json')
				}
			}
		},
		ui: {
			constructor: 'app/views/ApplicationView'
		}
	}
});

app.startup().then(function ():void {
	console.log('ready');
});

export = app;
