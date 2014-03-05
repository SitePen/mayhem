/// <reference path="../dojo" />

import has = require('../has');

var platform = has('host-browser') ? 'dom/' : '';

export function load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void {
	require([ resourceId ], load);
}

export function normalize(resourceId:string, normalize:(id:string) => string):string {
	return normalize('./' + platform + resourceId);
}
