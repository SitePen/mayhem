import core = require('../../../interfaces');
import ProxtyBinder = require('../../../binding/ProxtyBinder');
import Scheduler = require('../../../Scheduler');

export function createProxtyBinder():ProxtyBinder {
	return new ProxtyBinder({
		app: <core.IApplication> { scheduler: <core.IScheduler> new Scheduler() }
	});
}
