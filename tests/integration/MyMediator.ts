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
}

export = MyMediator;
