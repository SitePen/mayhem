import LogLevel from './LogLevel';

interface Logger {
	log(message: string, level?: LogLevel, category?: string ): void;
}

export default Logger;
