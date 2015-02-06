var bundle = {
	asString: 'es {number, plural, =0 {cero} other {#}}',
	asFunction: function (values:{ number:number; } = { number: 0 }) {
		return `es ${values.number}`;
	},
	asObject: {
		format: function (values:{ number:number; } = { number: 0 }) {
			return `es ${values.number}`;
		}
	}
};

export = bundle;
