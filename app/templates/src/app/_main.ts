/// <reference path="../mayhem/_typings/mayhem/mayhem.d.ts" />

import WebApplication = require('mayhem/WebApplication');

var app:WebApplication = new WebApplication({
	name: '<%= appTitle %>',
	components: {
		router: {
			defaultRoute: { routeId: 'index' },
			rules: [
				{
					routeId: 'index',
					path: 'index'
				}
			],
			routes: {
				index: 'app/routes/Index'
			}
		}
	}
});
app.run().otherwise(function (error:Error):void {
	console.log('app error', error);
});

export = app;
