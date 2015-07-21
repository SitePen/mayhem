/// <reference path="../../../mayhem/_typings/dstore/dstore" />

import declare = require('dojo/_base/declare');
import Memory = require('dstore/Memory');
import Trackable = require('dstore/Trackable');

interface TestStore<T> extends Memory<T> {}

var TestStore:{
	new <T>(kwArgs?:HashMap<any>):TestStore<T>;
} = <any> declare([ Memory, Trackable ]);

export = TestStore;
