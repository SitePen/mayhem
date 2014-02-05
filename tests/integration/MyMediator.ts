import Deferred = require('dojo/Deferred');
import Mediator = require('../../Mediator');

class MyMediator extends Mediator {
	_fullNameGetter():string {
		return this.get('model').get('fullName').replace(/J/g, 'B');
	}

	_fullNameIsBoeBloggerGetter():boolean {
		return this.get('fullName') === 'Boe Blogger';
 	}

	_lastNameIsBloggsGetter():boolean {
		return this.get('model').get('lastName') === 'Bloggs';
	}

	_remoteErrorGetter():IPromise<void> {
		var dfd:IDeferred<void> = new Deferred<void>();
		setTimeout(():void => {
			dfd.reject(new Error('failed to get remote string'));
		}, 6000);
		return dfd.promise;
	}

	_remoteStringGetter():IPromise<string> {
		var dfd:IDeferred<string> = new Deferred<string>();
		setTimeout(():void => {
			dfd.resolve('remote string');
		}, 3000);
		return dfd.promise;
	}

	save():void {
		if (this.get('model')) {
			console.log('Allow us to save some data!');
		}
		else {
			console.log('There is no data to save!');
		}
	}
}

export = MyMediator;
