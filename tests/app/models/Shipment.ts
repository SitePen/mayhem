import Model = require('mayhem/data/Model');

class Shipment extends Model {
}

Shipment.schema(():any => {
	return {
		id: Shipment.property<number>({
			label: 'id'
		}),
		name: Shipment.property<string>({
			label: 'Name',
			value: 'Unnamed'
		})
	};
});

export = Shipment;
