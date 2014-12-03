/// <reference path="../node" />

import os = require('os');

class File {
	static defaultLines:string[] = [];

	protected fileName:string;
	protected dest:any;
	protected lines:string[];

	constructor(fileName:string, dest:any) {
		this.fileName = fileName;
		this.dest = dest;

		if (dest.exists(fileName)) {
			this.lines = dest.read(fileName).trim().split('\n').map(function (line:string):string {
				return line.trim();
			});
		}
		else {
			this.lines = (<any> this.constructor).defaultLines.slice();
		}
	}

	addLine(line:string):void {
		this.lines.push(line);
	}

	contains(needle:string):boolean {
		return this.lines.some(function (line:string):boolean {
			return line.indexOf(needle) > -1;
		});
	}

	write():void {
		this.dest.write(this.fileName, this.lines.join(os.EOL) + os.EOL);
	}
}

export = File;
