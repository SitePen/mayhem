/// <reference path="../../dojo.d.ts" />
/// <reference path="../../xstyle.d.ts" />

import hasClass = require('xstyle/has-class');
import WebApplication = require('framework/WebApplication');

var app = new WebApplication({
	modules: {
		router: {
			mediatorPath: 'app/mediators',
			viewPath: 'framework/templating/html!app/views',
			defaultRoute: 'monsters',

			routes: {
				monsters: {
					view: 'Monsters',
					collections: {
						monsters: 'monsters'
					}
				},
				'monsters/monster': {
					view: 'Monster',
					collections: {
						monsters: 'monsters',
						backgrounds: 'backgrounds'
					},
					path: '<monsterId:\\d+>'
				}
			}
		},
		collections: {
			defaultStore: 'framework/store/RequestMemory',
			modelPath: 'app/models',
			models: {
				backgrounds: {
					model: 'Background',
					target: require.toUrl('app/data/backgrounds.json')
				},
				monsters: {
					model: 'Monster',
					store: 'framework/store/Memory'
				}
			}
		},
		ui: {
			constructor: 'app/views/ApplicationView'
		}
	}
});

app.startup().then(function ():void {
	hasClass('tablet', 'phone');
	console.log('ready');
});

export = app;
