import LogLevel = require('./LogLevel');

class ConsoleLogger {
	log(message: string, level?: LogLevel, category?: string ): void {
		// TS7017
		(<any> console)[LogLevel[level].toLowerCase()]((category ? category + ': ' : '') + message);
	}
}

export = ConsoleLogger;
