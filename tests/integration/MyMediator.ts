/// <reference path="../../dojo" />

import Deferred = require('dojo/Deferred');
import Mediator = require('../../data/Mediator');
import MemoryStore = require('dojo/store/Memory');
import ObservableStore = require('dojo/store/Observable');

class MyMediator extends Mediator {
	save(skipValidation?:boolean):IPromise<void> {
		if (this.get('model')) {
			console.log('Allow us to save some data!');
		}
		else {
			console.log('There is no data to save!');
		}
		return;
	}
}

MyMediator.schema(():any => {
	return {
		colors_string: MyMediator.property<string>({
			label: 'Colors (string to array)',
			get: function ():string {
				return (this.get('colors') || '').toString();
			},
			set: function (value:string):void {
				this.set('colors', value.split(','));
			},
			dependencies: [ 'colors' ]
		}),

		fullName: MyMediator.property<string>({
			label: 'Full Name',
			get: function ():string {
				var model = this.get('model'),
					fullName = model.get('firstName') + ' ' + model.get('lastName');
				return fullName.replace(/J/g, 'B');
			},
			set: function (value:string):void {
				var names:string[] = value.split(' ');
				this.get('model').set({
					firstName: names[0],
					lastName: names.slice(1).join(' ')
				});
			},
			dependencies: [ 'firstName', 'lastName' ]
		}),

		fullNameIsBoeBlogger: MyMediator.property<boolean>({
			label: 'Full name (transformed) should be "Boe Blogger"',
			get: function ():boolean {
				return this.get('model').get('fullName') === 'Boe Blogger'
			},
			dependencies: [ 'fullName' ]
		}),

		lastNameIsBloggs: MyMediator.property<boolean>({
			label: 'Last name should be "Bloggs"',
			get: function ():boolean {
				return this.get('model').get('lastName') === 'Bloggs';
			},
			dependencies: [ 'lastName' ]
		}),

		phone_numbers: MyMediator.property<ObservableStore<any>>({
			label: 'Remote Object (returns after 4 seconds)',
			get: function ():ObservableStore<any> {
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
		}),

		remoteError: MyMediator.property<IPromise<void>>({
			label: 'Remote Error (fails after 6 seconds)',
			get: function ():IPromise<void> {
				var dfd:IDeferred<void> = new Deferred<void>();
				setTimeout(():void => {
					dfd.reject(new Error('failed to get remote string'));
				}, 6000);
				return dfd.promise;
			}
		}),

		remoteObject: MyMediator.property<IPromise<any>>({
			label: 'Remote Object (returns after 4 seconds)',
			get: function ():IPromise<any> {
				var dfd:IDeferred<any> = new Deferred<any>();
				setTimeout(():void => {
					dfd.resolve({ foo: 'hello', bar: [ 3, 2, 1 ] });
				}, 4000);
				return dfd.promise;
			}
		}),

		remoteString: MyMediator.property<IPromise<string>>({
			label: 'Remote Object (returns after 4 seconds)',
			get: function ():IPromise<string> {
				var dfd:IDeferred<string> = new Deferred<string>();
				setTimeout(():void => {
					dfd.resolve('remote string');
				}, 2000);
				return dfd.promise;
			}
		})
	};
});

export = MyMediator;
