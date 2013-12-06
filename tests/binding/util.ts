import core = require('../../interfaces');
import PropertyRegistry = require('../../binding/PropertyRegistry');
import Scheduler = require('../../Scheduler');

export function createPropertyRegistry():PropertyRegistry {
	return new PropertyRegistry({
		app: <core.IApplication> { scheduler: <core.IScheduler> new Scheduler() }
	});
}
