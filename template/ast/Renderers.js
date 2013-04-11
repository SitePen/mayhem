define([
	'exports',
	'./RootRender',
	'./ProgramRender',
	'./ElementRender',
	'./AttributeRender',
	'./TextRender',
	'./ContentRender',
	'./VariableRender',
	'./BlockRender',
	'./PlaceholderRender'
], function (
	exports,
	RootRender,
	ProgramRender,
	ElementRender,
	AttributeRender,
	TextRender,
	ContentRender,
	VariableRender,
	BlockRender,
	PlaceholderRender
) {
	exports.Root = RootRender;
	exports.Program = ProgramRender;
	exports.Element = ElementRender;
	exports.Attribute = AttributeRender;
	exports.Text = TextRender;
	exports.Content = ContentRender;
	exports.Variable = VariableRender;
	exports.Block = BlockRender;
	exports.Placeholder = PlaceholderRender;
});