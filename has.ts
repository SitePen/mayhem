/// <reference path="dojo.d.ts" />

import has = require('dojo/has');
import util = require('./util');

has.add('debug', true);

// Pragmatically, it is not really necessary to check for every individual ES5 interface, since with the exception of
// Function#bind in Safari 5.1.3-, all the supported ES5-compliant browsers implement all the ES5 features we need
// to branch for. `Date.now` just happens to be the shortest new ES5 API, so it is the one that is checked. Shims are
// intentionally excluded since their code paths will effectively be the same as our non-ES5 code paths anyway.
has.add('es5', Date.now && Date.now.toString().indexOf('[native code]') > -1);

if (typeof window !== 'undefined') {
	var minimumWindowDimension = Math.min(window.innerWidth, window.innerHeight);

	has.add('phone', has('touch') && minimumWindowDimension <= 640);
	has.add('tablet', has('touch') && !has('phone'));
}

export = has;
