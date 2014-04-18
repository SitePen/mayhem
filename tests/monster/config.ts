var config = {
	modules: {
		router: {
			defaultRoute: 'monsters',
			controllerPath: 'app/controllers',

			routes: {
				monsters: {
					modules: {
						view: '!./MonsterGallery.html',
						store: {
							backgroundStore: 'Background',
							bodyStore: 'Body',
							eyesStore: 'Eyes',
							mouthStore: 'Mouth',
							store: 'Monster'
						}
					}
				},
				'monsters/monster': {
					path: '<monsterId:\\d+>',
					modules: {
						store: 'Monster',
						view: '!./MonsterDetail.html',
						viewModel: './Monster'
					}
				}
			}
		},
		stores: {
			defaultStore: 'framework/store/RequestMemory',
			models: {
				Background: {
					target: 'data/backgrounds.json'
				},
				Body: {
					target: 'data/bodies.json'
				},
				Eyes: {
					target: 'data/eyes.json'
				},
				Monster: {
					target: 'data/monsters.json'
				},
				Mouth: {
					target: 'data/mouths.json'
				}
			}
		},
		view: {
			constructor: '!./Application.html'
		}
	}
};

export = config;
