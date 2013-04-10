{
	var parser = this;

	function verifyMatch(open, close)	{

		if (open !== close) {
			var offset = Math.max(pos, rightmostFailuresPos),
				errorPosition = computeErrorPosition();

			throw new parser.SyntaxError(
			[quote('' + open)],
			close,
			offset,
			errorPosition.line,
			errorPosition.column - close.length - 2 // 2 is for closing tag
			);
		}
	}

	function ProgramNode(statements, inverse) {
		this.type = 'Program';
		this.statements = statements;
		if (inverse) {
			this.inverse = new ProgramNode(inverse);
		}
	}

	function BlockNode(variable, program, inverse, close) {
		verifyMatch(variable, close);

		this.type = 'Block';
		this.variable = variable;
		this.program = program;
		this.inverse = inverse;

		this.isInverse = !!inverse && !program;
	}

	function VariableNode(id) {
		this.type = 'Variable';
		this.id = id;

		// the following may get changed by code acting on an instance of this node
		this.bound = false;
		this.inverted = false;
		this.unescaped = false;
	}

	function PlaceholderNode(name) {
		this.type = 'Placeholder';
		this.name = name || 'default';
	}

	function ContentNode(content) {
		this.type = 'Content';
		this.content = content;
	}
}

start
	= __ program:program __ { return program; }

// TODO: there are 2 contexts in which this parser is used - pre-DOM and post-DOM.  during pre-DOM,
// we are only concerned about extracting blocks of information.  during post-DOM, we are only
// concerned about parsing variables.  we should split this parser into 2 pieces if possible.

program
	= statements:statements simpleInverse inverse:statements {
			return new ProgramNode(statements, inverse);
		}
	/ statements:statements simpleInverse {
			return new ProgramNode(statements, []);
		}
	/ statements:statements {
			return new ProgramNode(statements);
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
	/ variableBlock
	/ placeholder
	/ content:Content {
			return new ContentNode(content);
		}
	// TODO: Comment


simpleInverse
	= OpenInverse Close

openInverse
	= OpenInverse id:path Close {
			return variable;
		}

closeBlock
	= OpenEndBlock path:path Close {
			return path;
		}

openBlock
	// TODO: there are variations of blocks
	= OpenBlock path:path Close {
			return path;
		}

variableBlock
	= OpenVariable variable:variable Close {
			return variable;
		}
	/ OpenUnescaped variable:variable Close {
			variable.unescaped = true;
			return variable;
		}

placeholder
	= OpenPlaceholder WhiteSpace* name:Id*  WhiteSpace* Close {
		return new PlaceholderNode(name.join(''));
	}

variable
	= simpleVariable
	/ boundVariable
	/ invertedVariable

invertedVariable
	= '!' variable:simpleVariable {
			variable.inverted = true;
			return variable;
		}
	/ '!' variable:boundVariable {
			variable.inverted = true;
			return variable;
		}

boundVariable
	= '@' variable:simpleVariable {
			variable.bound = true;
			// TODO: does this need to be returned?
			return variable;
		}
	/ '@' variable:invertedVariable {
			variable.bound = true;
			return variable;
		}

simpleVariable
	= path:path {
			return new VariableNode(path);
		}

path
	= segments:pathSegments {
			return segments.join('.');
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

Open
	= '<%'

Close
	= WhiteSpace* '%>'

OpenVariable
	= Open WhiteSpace*

OpenBlock
	= Open '=' WhiteSpace*

OpenEndBlock
	= Open '/' WhiteSpace*

OpenInverse
	= Open WhiteSpace* 'else'

OpenUnescaped
	= Open '!' WhiteSpace*

OpenPlaceholder
	= Open '&' WhiteSpace*

Sep
	= [\/.]

Id
	= id:[a-zA-Z0-9_$-]+ &([%\/.]/WhiteSpace){
			return id.join('');
		}
	/ '[' id:[^\]]* ']' {
			return id.join('');
		}

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