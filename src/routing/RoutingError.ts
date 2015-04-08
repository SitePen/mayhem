import createError = require('dojo/errors/create');
import Request from './Request';

interface RoutingError extends Error {
	request: Request;
}

var RoutingError: {
	new (message: string, request?: Request): RoutingError;
	prototype: RoutingError;
};

function Ctor(message: string, request?: Request) {
	this.request = request;
}

RoutingError = createError('RoutingError', Ctor, Error, {});

export default RoutingError;
