import Model = require('framework/data/Model');
import RequestMemory = require('framework/store/RequestMemory');

class MonsterModel extends Model {}

MonsterModel.schema(():any => {
	return {
		id: Model.property<number>({}),
		bodyId: Model.property<number>({}),
		eyesId: Model.property<number>({}),
		mouthId: Model.property<number>({}),
		shareLink: Model.property<string>({})
	};
});

export = MonsterModel;
