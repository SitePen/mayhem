PEGJSSRC=template/peg/parser.pegjs
PEGJSOUT=template/peg/parser.js

parser: template/peg/parser.pegjs
	@echo -n 'generating parser...'
	# TODO: add pegjs to devDependencies and use via ./node_modules/etc.
	@cat $(PEGJSSRC) | pegjs | sed -e '1 s/.*/define([], function () {/' -e '$$ s/.*/});/' > $(PEGJSOUT)
	@echo 'Done!'
