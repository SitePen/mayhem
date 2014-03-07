import Deferred = require('dojo/Deferred');
import Mediator = require('../../data/Mediator');
import MemoryStore = require('dojo/store/Memory');
import ObservableStore = require('dojo/store/Observable');

class MyMediator extends Mediator {
	_phone_numbers:ObservableStore<any>;

	_fullNameGetter():string {
		return this.get('model').get('fullName').replace(/J/g, 'B');
	}

	_fullNameIsBoeBloggerGetter():boolean {
		return this.get('fullName') === 'Boe Blogger';
 	}

	_lastNameIsBloggsGetter():boolean {
		return this.get('model').get('lastName') === 'Bloggs';
	}

	_colors_stringGetter():string {
		return this.get('colors').toString();
	}

	_colors_stringSetter(value:string):void {
		this.set('colors', value.split(','));
	}

	_phone_numbersGetter():ObservableStore<any> {
		if (!this._phone_numbers) {
			this._phone_numbers = new ObservableStore(new MemoryStore({ data: [
				{
					id: 'primary',
					type: 'mobile',
					value: '555-555-5555'
				},
				{
					id: 'secondary',
					type: 'mobile',
					value: '555-555-1234'
				}
			]}));
		}
		return this._phone_numbers;
	}

	_remoteErrorGetter():IPromise<void> {
		var dfd:IDeferred<void> = new Deferred<void>();
		setTimeout(():void => {
			dfd.reject(new Error('failed to get remote string'));
		}, 6000);
		return dfd.promise;
	}

	_remoteObjectGetter():IPromise<any> {
		var dfd:IDeferred<any> = new Deferred<any>();
		setTimeout(():void => {
			dfd.resolve({ foo: 'hello', bar: [ 3, 2, 1 ] });
		}, 4000);
		return dfd.promise;
	}

	_remoteStringGetter():IPromise<string> {
		var dfd:IDeferred<string> = new Deferred<string>();
		setTimeout(():void => {
			dfd.resolve('remote string');
		}, 2000);
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
