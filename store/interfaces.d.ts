/// <reference path="../dstore.d.ts"/>

import core = require('../interfaces');

export interface IManager extends core.IObservable {
	getStore(id:string):IPromise<dstore.ICollection<any>>;
}
