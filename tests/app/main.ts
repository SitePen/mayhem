import WebApplication = require('framework/WebApplication');

var app = new WebApplication({
	modules: {
		router: {
			mediatorPath: 'app/mediators',
			viewPath: 'framework/templating/html!app/views',
			defaultRoute: 'items',

			routes: {
				items: {
					view: 'Items'
				},
				'items/item': {
					view: 'Item',
					path: '<itemId:\\d+>'
				},
				'items/item/edit': {
					mediator: 'items/Item',
					view: 'ItemEdit'
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
