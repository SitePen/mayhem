import LogLevel = require('./LogLevel');

interface Logger {
	log(message: string, level?: LogLevel, category?: string ): void;
}

export = Logger;
