import core = require('../../../interfaces');
import Observable = require('../../../Observable');
import ProxtyBinder = require('../../../binding/ProxtyBinder');
import Scheduler = require('../../../Scheduler');

export function createProxtyBinder():ProxtyBinder {
	return new ProxtyBinder({
		app:<core.IApplication><any> new Observable({
			scheduler: new Scheduler()
		})
	});
}
