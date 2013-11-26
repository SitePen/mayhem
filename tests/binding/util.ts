import PropertyRegistry = require('../../binding/PropertyRegistry');
import Scheduler = require('../../Scheduler');

export function createPropertyRegistry():PropertyRegistry {
	return new PropertyRegistry({
		app: <IApplication> { scheduler: <IScheduler> new Scheduler() }
	});
}
