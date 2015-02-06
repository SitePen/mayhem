var bundle = {
	root: {
		asString: 'ROOT {number, plural, =0 {zero} other {#}}',
		asFunction: function (values:{ number:number; } = { number: 0 }) {
			return `ROOT ${values.number}`;
		},
		asObject: {
			format: function (values:{ number:number; } = { number: 0 }) {
				return `ROOT ${values.number}`;
			}
		}
	},
	en: true,
	es: true
};

export = bundle;
