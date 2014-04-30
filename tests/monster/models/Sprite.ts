import Model = require('mayhem/data/Model');

class SpriteModel extends Model {
	type:string;
	ext:string;
}

SpriteModel.schema(():any => {
	return {
		id: Model.property<number>({
			label: 'ID'
		}),

		image: Model.property<string>({
			label: 'Image Name'
		}),

		src: Model.property<string>({
			get: function ():string {
				var model = this.get('model');
				return './images/' + model.type + '/' + model.type + model.get('image') + '.' + model.ext;
			},
			dependencies: [ 'image' ]
		})
	};
});

export = SpriteModel;
