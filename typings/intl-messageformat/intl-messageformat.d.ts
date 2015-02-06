declare class IntlMessageFormat<T> {
	constructor(message: string, locales?: string | string[], formats?: {});
	format(values?: T): string;
}

declare module 'intl-messageformat' {
	export = IntlMessageFormat;
}
