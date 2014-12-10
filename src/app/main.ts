import WebApplication = require('mayhem/WebApplication');

var app:WebApplication = new WebApplication({
	name: 'Prototype 2',

	components: {
		router: {
			defaultRoute: ['index'],
			routes: {
				index: {
					view: 'app/views/Index.html'
				},
				registration: {
					model: 'app/viewModels/Registration',
					view: 'app/views/Registration'
				},
				thanks: {
					view: 'app/views/Thanks.html'
				}
			}
		}
	}
});

app.run();

export = app;