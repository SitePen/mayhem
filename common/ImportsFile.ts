import File = require('./File');

class ImportsFile extends File {
	static defaultLines:string[] = [
		'/* tslint:disable:no-unused-variable */'
	];

	containsImport(variableName:string, moduleId:string):boolean {
		return this.contains('import ' + variableName + ' = require(\'' + moduleId + '\');');
	}

	addImport(variableName:string, moduleId:string):void {
		this.addLine('import ' + variableName + ' = require(\'' + moduleId + '\');');
	}

	write():void {
		this.lines.sort();
		super.write();
	}
}

export = ImportsFile;
