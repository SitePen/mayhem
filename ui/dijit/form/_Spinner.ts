import configure = require('../util/configure');
import form = require('./interfaces');
import RangeBoundTextBox = require('./RangeBoundTextBox');

class _Spinner extends RangeBoundTextBox {
	// TODO: interfaces
}

configure(_Spinner, {
	Base: RangeBoundTextBox,
	schema: {
		defaultTimeout: Number,
		minimumTimeout: Number,
		timeoutChangeRate: Number,
		largeDelta: Boolean,
		smallDelta: Boolean
	}
});

export = _Spinner;
