import dom = require('./interfaces');
import _ElementRenderer = require('./_Element');
import roles = require('./roles');
import util = require('../../util');

class DialogRenderer extends _ElementRenderer {
	_dialogActions:any = roles.dialog;
}

DialogRenderer.prototype.className = 'dialog';

export = DialogRenderer;
