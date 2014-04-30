import Model = require('mayhem/data/Model');
import RequestMemory = require('mayhem/store/RequestMemory');

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
