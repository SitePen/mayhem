import dojoString = require('dojo/string');
import Model = require('framework/data/Model');

class MonsterModel extends Model {
	private _getSrcPath(type:string):string {
		var id:number = this.get(type + 'Id');
		return id == null ? '' : './images/' + type + '/' + type + dojoString.pad(id + 1, 2) + '.svg';
	}
}

MonsterModel.schema(():any => {
	return {
		id: Model.property<number>({
			label: 'ID'
		}),
		bodyId: Model.property<number>({}),
		bodySrc: Model.property<string>({
			get: function ():string {
				return this.get('model')._getSrcPath('body');
			},
			dependencies: [ 'bodyId' ]
		}),
		eyesId: Model.property<number>({}),
		eyesSrc: Model.property<string>({
			get: function ():string {
				return this.get('model')._getSrcPath('eyes');
			},
			dependencies: [ 'eyesId' ]
		}),
		mouthId: Model.property<number>({}),
		mouthSrc: Model.property<string>({
			get: function ():string {
				return this.get('model')._getSrcPath('mouth');
			},
			dependencies: [ 'mouthId' ]
		})
	};
});

export = MonsterModel;
