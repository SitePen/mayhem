/// <reference path="../dojo" />
/// <amd-dependency path="../has!host-browser?./dom/Label" />

var Label = require('../has!host-browser?./dom/Label');

if (!Label) {
	throw new Error('Label is not supported on this platform');
}

export = Label;
