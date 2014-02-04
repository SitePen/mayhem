import Deferred = require('dojo/Deferred');
import Mediator = require('../../Mediator');

class MyMediator extends Mediator {
	_fullNameGetter():string {
		return this.model.get('fullName').replace(/J/g, 'B');
	}

	_lastNameIsBloggsGetter():boolean {
		return this.model.get('lastName') === 'Bloggs';
	}

	_fullNameIsBoeBloggerGetter():boolean {
		return this.get('fullName') === 'Boe Blogger';
	}

	save():void {
		if (this.model) {
			console.log('Allow us to save some data!');
		}
		else {
			console.log('There is no data to save!');
		}
	}

	_remoteStringGetter():IPromise<string> {
		var dfd:IDeferred<string> = new Deferred<string>();
		setTimeout(():void => {
			dfd.resolve('remote string');
		}, 5000);
		return dfd.promise;
	}

	_remoteFailureGetter():IPromise<void> {
		var dfd:IDeferred<void> = new Deferred<void>();
		setTimeout(():void => {
			dfd.reject(new Error('failed to get remote string'));
		}, 5000);
		return dfd.promise;
	}
}

export = MyMediator;
