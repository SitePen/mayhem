import Model = require('mayhem/data/Model');

class Quote extends Model {
}

Quote.schema(():any => {
	return {
		id: Quote.property<number>({
			label: 'id'
		}),
		name: Quote.property<string>({
			label: 'Name',
			value: 'Unnamed'
		})
	};
});

export = Quote;
