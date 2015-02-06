var bundle = {
	asString: 'en {number, plural, =0 {zero} other {#}}',
	asFunction: function (values:{ number:number; } = { number: 0 }) {
		return `en ${values.number}`;
	},
	asObject: {
		format: function (values:{ number:number; } = { number: 0 }) {
			return `en ${values.number}`;
		}
	}
};

export = bundle;
