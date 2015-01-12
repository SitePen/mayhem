declare module 'jsgi-node' {
	export interface IHttpHandler {
		(request:IHttpRequest):IHttpResponse;
	}

	export interface IHttpRequest {
		body:IHttpStream
		host:string;
		method:string;
		pathInfo:string;
		port:number;
		queryString:string;
		scheme:string;
		scriptName:string;
		url?:string;
	}

	export interface IHttpResponse {
		status:number;
		headers:{};
		body:IHttpStream;
	}

	interface IHttpServer {
		maxHeadersCount:number;
		close(callback?: any):void;
	}

	export interface IHttpStream extends Array<any> {
		// TODO string | INodeBuffer
		// forEach(callback:(item:any, index:number, array:any[]) => IPromise<void>):IPromise<void>;
		// forEach(callback:(item:any, index:number, array:any[]) => void):IPromise<void>;
		// forEach(callback:(item:any, index:number, array:any[]) => void):void;
	}

	interface IPromise<T> {
		always<U>(callback:(valueOrError:any) => U):IPromise<U>;
		cancel<U>(reason?:U, strict?:boolean):U;
		isCanceled():boolean;
		isFulfilled():boolean;
		isRejected():boolean;
		isResolved():boolean;
		otherwise<U>(errback:(reason:any) => IPromise<U>):IPromise<U>;
		otherwise<U>(errback:(reason:any) => U):IPromise<U>;
		then<U>(callback:(value:T) => IPromise<U>, errback?:(reason:any) => IPromise<U>, progback?:(update:any) => IPromise<U>):IPromise<U>;
		then<U>(callback:(value:T) => IPromise<U>, errback?:(reason:any) => U,           progback?:(update:any) => IPromise<U>):IPromise<U>;
		then<U>(callback:(value:T) => U,           errback?:(reason:any) => IPromise<U>, progback?:(update:any) => IPromise<U>):IPromise<U>;
		then<U>(callback:(value:T) => U,           errback?:(reason:any) => U,           progback?:(update:any) => IPromise<U>):IPromise<U>;
		then<U>(callback:(value:T) => IPromise<U>, errback?:(reason:any) => IPromise<U>, progback?:(update:any) => U):IPromise<U>;
		then<U>(callback:(value:T) => IPromise<U>, errback?:(reason:any) => U,           progback?:(update:any) => U):IPromise<U>;
		then<U>(callback:(value:T) => U,           errback?:(reason:any) => IPromise<U>, progback?:(update:any) => U):IPromise<U>;
		then<U>(callback:(value:T) => U,           errback?:(reason:any) => U,           progback?:(update:any) => U):IPromise<U>;
	}

	interface IHttpServerOptions {
		port?:number;
		ssl?:boolean;
	}

	export function start(app:IHttpHandler, options?:IHttpServerOptions):IHttpServer;
}
