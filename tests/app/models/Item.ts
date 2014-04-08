import Model = require('framework/data/Model');

class ItemModel extends Model {}
ItemModel.schema(():any => {
	return {
		id: Model.property<number>({
			label: 'ID'
		}),
		name: Model.property<string>({
			label: 'Name'
		})
	};
});

export = ItemModel;
