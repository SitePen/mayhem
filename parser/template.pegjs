// adapted from https://github.com/wycats/handlebars.js
// MIT license Copyright (C) 2011 by Yehuda Katz

// by the time we're done, this should be quite different to handlebars since it uses a jison parser
// and we'll likely mutilate the mustache syntax in different ways than handlebars

{
	var parser = this;

	function verifyMatch(open, close)	{
		open = open.path;
		close = close.path;

		if (open !== close) {
			var offset = Math.max(pos, rightmostFailuresPos),
				errorPosition = computeErrorPosition();

			throw new parser.SyntaxError(
			[quote('' + open)],
			close,
			offset,
			errorPosition.line,
			errorPosition.column - close.length - 2 // 2 is for closing mustache tag
			);
		}
	}

	function ProgramNode(statements, inverse) {
		this.type = 'program';
		this.statements = statements;
		if (inverse) {
			this.inverse = new ProgramNode(inverse);
		}
	}

	function BlockNode(mustache, program, inverse, close) {
		verifyMatch(mustache.id, close);

		this.type = 'block';
		this.mustache = mustache;
		this.program = program;
		this.inverse = inverse;

		this.isInverse = !!inverse && !program;
	}

	function MustacheNode(params, unescaped) {
		this.type = 'mustache';
		this.escaped = !unescaped;

		this.id = params[0];
		this.params = params.slice(1);
	}

	function PlaceholderNode(name) {
		this.type = 'placehoder';
		this.placeholderName = name;
	}

	function DataNode(id) {
		this.type = 'data';
		this.id = id;
	}

	function PlaceHolderNameNode(name) {
		this.type = 'placehoderName';
		this.name = name;
	}

	function IdNode(segments) {
		this.type = 'id';
		this.path = segments.join('.');
	}

	function ContentNode(content) {
		this.type = 'content';
		this.content = content;
	}

	function CommentNode(comment) {
		this.type = 'comment';
		this.comment = comment;
	}
}



start
	= __ program:program __ { console.log('program', program); return program; }

WhiteSpace "whitespace"
	= [\t\v\f \u00A0\uFEFF]

LineTerminatorSequence "end of line"
	= "\n"
	/ "\r\n"
	/ "\r"
	/ "\u2028" // line separator
	/ "\u2029" // paragraph separator

__
	= (WhiteSpace / LineTerminatorSequence)*

Content
	= chars:(ContentChars)+  {
			return chars.join('');
		}

ContentChars
	= '\\' backslash:'\\' &Open {
			return backslash;
		}
	/ '\\' open:Open {
			return open;
		}
	/ !Open char:. {
			return char;
		}

OpenPlaceholder
	= '{{:'

OpenBlock
	= '{{#'

OpenEndBlock
	= '{{/'

OpenInverse
	= '{{^'
	/ '{{' [\s]* 'else'

OpenUnescaped
	= '{{{'
	/ '{{&'

OpenBlockComment
	= '{{!--'

Open
	= '{{'

Close
	= '}}}'
	/ '}}'

Data
	= '@'[a-zA-Z]+

Comment
	= '{{!' chars:CommentChars* '}}' {
		return chars.join('');
	}

CommentChars
	= !'}}' chars:. { return chars; }

PlaceholderName
	= [a-zA-Z0-9_$-/]+

Sep
	= [\/.]

Id
	= id:[a-zA-Z0-9_$-]+ &[=}\s\/.] {
			return id.join('');
		}
	/ '[' id:[^\]]* ']' {
			return id.join('');
		}


program
	= simpleInverse inverse:statements {
			return new ProgramNode([], inverse);
		}
	/ statements:statements simpleInverse inverse:statements {
			return new ProgramNode(statements, inverse);
		}
	/ statements:statements simpleInverse {
			return new ProgramNode(statements, []);
		}
	/ statements:statements {
			return new ProgramNode(statements);
		}
	/ simpleInverse {
			return new ProgramNode([], []);
		}
	/ '' {
			return new ProgramNode([]);
		}

statements
	= statement:statement statements:(statement)* {
			statements.unshift(statement);
			return statements;
		}

statement
	= open:openInverse program:program close:closeBlock {
			return new BlockNode(open, program.inverse, program, close);
		}
	/ open:openBlock program:program close:closeBlock {
			return new BlockNode(open, program, program.inverse, close);
		}
	/ mustache
	/ placeholder
	/ content:Content {
			return new ContentNode(content);
		}
	/ comment:Comment {
			return new CommentNode(comment);
		}

openBlock
	= OpenBlock mustache:inMustache Close {
			return new MustacheNode(mustache);
		}

openInverse
	= OpenInverse mustache:inMustache Close {
			return new MustacheNode(mustache);
		}

closeBlock
	= OpenEndBlock path:path Close {
			return path;
		}

mustache
	= Open mustache:inMustache Close {
			return new MustacheNode(mustache);
		}
	/ OpenUnescaped mustache:inMustache Close {
			return new MustacheNode(mustache);
		}

placeholder
	= OpenPlaceholder name:placeholderName Close {
			return new PlaceholderNode(name);
		}

simpleInverse
	= OpenInverse Close

inMustache
	= path:path params:params {
			return [].concat(path, params);
		}
	/ path:path {
			return [ path ];
		}
	/ data:Data {
			return new DataNode(data);
		}

params
	= param:param params:(param)* {
			params.unshift(param);
			return params;
		}
	/ param:param {
			return [ param ];
		}

param
	= path:path {
			return path;
		}
	/ data:Data {
			return new DataNode(data);
		}

placeholderName
	= name:PlaceholderName {
			return new PlaceholderNameNode(name);
		}

path
	= segments:pathSegments {
			return new IdNode(segments);
		}

pathSegments
	= id:Id segments:(pathSegment)* {
			segments.unshift(id);
			return segments;
		}

pathSegment
	= Sep id:Id {
			return id;
		}