import RangeBoundTextBox = require('./RangeBoundTextBox');

class _Spinner extends RangeBoundTextBox {
	static _dijitConfig:any = {
		defaultTimeout: 'number',
		minimumTimeout: 'number',
		timeoutChangeRate: 'number',
		largeDelta: 'boolean',
		smallDelta: 'boolean'
	};
}

_Spinner.configure(RangeBoundTextBox);

export = _Spinner;
