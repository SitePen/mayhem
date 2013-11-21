/// <reference path="dojo.d.ts" />

import has = require('dojo/has');

has.add('debug', true);
has.add('es5-object-keys', typeof Object.keys !== 'undefined');

if (typeof window !== 'undefined') {
	var minimumWindowDimension = Math.min(window.innerWidth, window.innerHeight);

	has.add('phone', has('touch') && minimumWindowDimension <= 640);
	has.add('tablet', has('touch') && !has('phone'));
}

export = has;
