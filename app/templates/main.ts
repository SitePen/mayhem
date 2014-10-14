import WebApplication = require('mayhem/WebApplication');

var app:WebApplication = new WebApplication({
	name: 'Mayhem TodoMVC',
	components: {
		router: {
			routes: {
				'index': {
					model: 'app/viewModels/Index',
					path: 'todos/<show:all|incomplete|complete>',
					view: 'app/views/Index.html'
				}
			}
		}
	}
});
app.startup().otherwise(function (error) {
	console.log('app error', error);
});

export = app;
