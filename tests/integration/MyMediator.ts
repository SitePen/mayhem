import Mediator = require('../../Mediator');

class MyMediator extends Mediator {
	_fullNameGetter():string {
		var fullName:string = this.model.get('fullName');
		return fullName.replace(/J/g, 'B');
	}

	_lastNameIsBloggsGetter():boolean {
		return this.model.get('lastName') === 'Bloggs';
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
