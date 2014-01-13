# Mayhem

## Setup

* Clone the repo from the demo branch, `git clone --branch demo --recursive git@github.com:SitePen/mayhem.git`
* Check out the framework submodule to track master, since this is where development will actually occur,
  `cd src/framework && git checkout master`

## Conventions

* Follows the [dojo2-core guidelines](https://github.com/csnover/dojo2-core#code-conventions) for all JavaScript
  syntaxes
* For type hints, there MUST NOT be whitespace between the identifier and its type (to differentiate between types
  and object literal keys)
* Compiler should be executed with `--module AMD` and `--noImplicitAny` flags
* Imports should be ordered alphabetically, case-insensitive, by identifier
* Class properties should be ordered alphabetically, case-insensitive, ignoring leading underscores, in the following
  order:
	* static properties
	* static methods
	* instance properties
	* constructor
	* instance methods

# TODO: The below information is old
# Regenerating the PEG parser
this requires PEGJS to be installed globally
TODO: add PEGJS to `devDependencies` and use `npm install` to install it
```
npm install -g pegjs
```

once pegjs is installed then from the root of this repo:
```
make parser
```
