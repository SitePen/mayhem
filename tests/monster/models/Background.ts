/// <reference path="../../../dojo" />

import dojoString = require('dojo/string');
import Model = require('framework/data/Model');

class BackgroundModel extends Model {}

BackgroundModel.schema(():any => {
	return {
		id: Model.property<number>({
			label: 'ID'
		}),
		src: Model.property<string>({
			get: function ():string {
				var id = this.get('model').get('id');
				return 'images/background/background' + dojoString.pad(id + 1, 2) + '.png';
			},
		})
	};
});

export = BackgroundModel;
