define([
	'exports',
	'./RootRender',
	'./ProgramRender',
	'./ElementRender',
	'./AttributeRender',
	'./TextRender',
	'./ContentRender',
	'./IdRender'
], function (
	exports,
	RootRender,
	ProgramRender,
	ElementRender,
	AttributeRender,
	TextRender,
	ContentRender,
	IdRender
) {
	exports.Root = RootRender;
	exports.Program = ProgramRender;
	exports.ElementNode = ElementRender;
	exports.AttributeNode = AttributeRender;
	exports.TextNode = TextRender;
	exports.ContentNode = ContentRender;
	exports.IdNode = IdRender;
});