import createError = require('dojo/errors/create');
import Request = require('./Request');

interface RoutingError extends Error {
	request:Request;
}

var RoutingError:{
	new (message:string, request?:Request):RoutingError;
	prototype:RoutingError;
};

function Ctor(message:string, request?:Request):void {
	this.request = request;
}

RoutingError = createError('RoutingError', Ctor, Error, {});

export = RoutingError;
