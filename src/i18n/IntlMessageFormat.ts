/// <amd-dependency path="../has!intl?:intl" />

// This file is a hack because Yahoo removed AMD support from intl-messageformat and everything they do relies on
// globals and inadequate client-side API

import has = require('../has');
import ImportedIntlMessageFormat = require('intl-messageformat');

var out: typeof IntlMessageFormat;

if (typeof IntlMessageFormat !== 'undefined') {
	out = IntlMessageFormat;
}
else {
	out = ImportedIntlMessageFormat;
}

export = out;
