Introducing Mayhem
==================

Mayhem is a client-side framework for model-driven web applications.

Features
--------
* Fully modular, 100% AMD
* Easy routing - get multi-page app accessibility with single-page app performance
* Two-way data binding - automatically keep your views & models in sync
* Superior templating - a special syntax designed just for JavaScripters
* Asynchronous everything - fully promises-aware components keep your async code clean
* ActiveRecord models - data models with relations, validation, and fixtures
* Unit testing with The Intern, the most advanced JS testing available
* Amazing widgets - a new cross-platform widget library that provides a native look-and-feel
* Completely localised - dates, currency, times, and string; Mayhem does it all thanks to Dojo
* Fully accessible - widgets and views use ARIA to ensure usability for all humans
* Zero global pollution - natives are never touched, so there is no risk of collision
* Iron-clad licensing - the only framework with a 100-point open-source CLA requirement
* User Authentication TODO: Flesh this out
* Command line support for generating application skeleton and adding routes and views TODO: Confirm this and flesh it out.
* TODO: More features?

TODO: SUGGESTION from Mangala: some way to automate downloading deps and creating skeleton project would be nice; maybe just a repo like dbp

Why Mayhem?
===========

For years, we've focused on building great tools for the Dojo Toolkit and using them to build solid, maintainable applications. We encountered common, application-level issues like managing application views and properly sep of concerns between the data model and the UI. Instead of forcing each developer to apply insight and discipline to these issues, it is better to provide a framework to handle them so developers can focus on what makes their application special.

TODO: What distinguishes Mayhem from other MVC-like frameworks?

The Makings of Mayhem
=====================

TODO: Include high-level diagram of the architecture

Application
-----------
An application is an instance of the Application object and is responsible for initializing all application-level modules
(for example: the router, the main dw widget, and data stores).

Views
-----
Views are the UI of your application and are based on templates. Each view is bound to an underlying model,
and all fields bound to the model are two-way data bound by default. Views may contain placeholders for other views,
allowing for a hierarchy of view components.

View Templates
--------------
View templates are written with a mix of HTML and Mayhem-specific tags including <if>, <elseif>, <else>,
<for>, <when>, <data>, and <widget>. Mayhem tags are data-bound by default.
HTML element attributes may be data-bound as well.

Models
------
A Model is an observable encapsulation of information and can validate and save changes.

Controllers
-----------
Controllers implement the application's behavior and are the bridge between models and views.

Router
------
The router is a tool for managing application state via a hierarchy of routes. A route:
* has a unique ID
* encapsulates a controller and a view
* may take arguments (identifiers are a common example)
* may be a child of another route if its route IDstarts with the parent's route ID
(e.g., parent, parent/child, and parent/child/grandchild)

Route IDs are used to create a path to a route. One route ID plus two different sets of parameters
yields two distinct paths. Paths are what the router uses to determine route changes.

The router knows the current path to a route and listens for path changes. When there is a path change,
the router looks up the route based on the path, deactivates the current route with its ancestors
and activates the new route and its ancestors. Visually, this amounts to showing and hiding views
when the path changes.

In cases where two different views should be shown for the same path,
two separate routes may be given the same path; however, which route is activated first is
currently browser-dependent because the order of iterating over the route map may vary across browsers.



Creating a Mayhem Application
=============================

TODO: Include simplest way to obtain Mayhem and utilize it to create an app. Install mayhem grunt tasks via npm?

Reference
=========

The Shape of a Mayhem Application
---------------------------------

TODO: Directory structure and minimum modules for a viable app. Both currently outlined in the tutorial.

The Application Object
----------------------
The `mayhem/Application` module is the top-level framework component for your application. For web applications, you will generally use `mayhem/WebApplication` (which extends `mayhem/Application`).

Application Configuration
-------------------------

TODO: Mention the modules property and the fact that the `ui` and `router` are staples

This section describes the form of the configuration object passed to the Application constructor.

All properties of the configuration object are mixed into the application object. However, there is a special property named `modules` that is not mixed in as-is. The `modules` property contains configurations for framework components such as the router, the main application view, and the authenticated user.

Here is an example application object with inline comments:
```javascript
define([
    '../components/User'
], function (User) {
    return {

		// Arbitrary properties like this one may be set on the configuration. When the configuration is passed to the application constructor, they will be added to the application object.
        brandName: 'My App',

		// Configuration for framework modules
        modules: {
			// The application router
            router: {
				// The default Router module is provided by the Application module but may be overridden with the constructor property
				// constructor: 'app/routing/CustomRouter',

				// The module ID prefix used to resolve controller module IDs 
                controllerPath: 'app/controllers',

				// The module ID prefix used to resolve view module IDs 
                viewPath: 'app/views',

				// The module ID prefix used to resolve template module IDs
				templatePath: 'framwork/template!app/views',

				// The application's routes. The resolved controller, view, and template MIDs are displayed above each route.
                routes: {
					// app/controllers/IndexController, app/views/IndexView, mayhem/template!app/views/IndexView.html
                    'index': {},

					// mayhem/Controller, mayhem/View, mayhem/template!app/views/ContactsView.html
                    'contacts': { view: null, controller: null },

					// mayhem/Controller, mayhem/View, mayhem/template!app/views/ContactView.html					
					// This route has a numeric id argument for its path
                    'contacts/contact': {
                        view: null,
                        controller: null,
                        path: '<id:\\d+>'
                    },

					// mayhem/Controller, mayhem/View, mayhem/template!app/views/CategoryView.html					
					// This route has a category argument for its path. The value of category may be friends, relatives, or business.
                    'contacts/contact/category': {
                        view: null,
                        controller: null,
                        path: '<category:friends|relatives|business>'
                    },

					// TODO: Explain this. It appears to be a way to serve static content, but it was not easy to confirm at a glance in the Route module.
                    'static': { path: 'static/<page:\\w+>' }
                },
				
				// The default route ID. Set this to override the default route of 'index'
                // defaultRoute: 'customDefaultRoute'

				// The route ID to use when the app navigates to a path and no match route is found
                notFoundRoute: 'error'
            },

			// The main application view
			// Provide a `ui` property in `modules` to override the default application view.
			ui: {
				// This defaults to app/views/ApplicationView. Provide a constructor property to override.
				//constructor: 'app/views/CustomApplicationView'
			},

			// TODO: Explain this.
            user: {
                constructor: User,
                loginUrl: 'mock/login.json',
                logoutUrl: 'mock/logout.json',
                username: 'guest',
                realname: 'Guest'
            }
        }
    };
});
```

The options set in your configuration will be in effect for the lifetime of the application.

The Application View
--------------------
The application view is the main UI of your application. Individual views are loaded into the application view.
For example, if your application has a common header and footer, these would be defined in your application view.
The application view can be templated.

The Router
----------

// TODO: Review for correctness

The `mayhem/routing/Router` module provides flexible and configurable routing. Extensive functionality is provided out-of-the-box, including:
* pattern-based matching for routing paths
* default route
* error route

The `mayhem/routing/Route` module determines the appropriate `View` to load and attaches the appropriate `Controller` to the `View`.
The `mayhem/routing/RouteEvent` module provides robust routing events that can be canceled, paused, and resumed.

Let's look at a few entries from our configuration:
<pre>
routes: {
    index: {}
}
</pre>

This simple configuration tells the router:
* "/index" is a valid route
* The view module for this route is `app/views/IndexView.js`. This module id is derived from:
    * `config.viewPath = 'app/views'`
    * proper-casing the route name (index => Index)
    * appending "View" to the route name (Index => IndexView).
* Similarly, the controller for this route is `app/controllers/IndexController.js`.
    * the module path in this case is from `config.controllerPath`
As you can see, some values are implicitly derived based on convention. You can also explicitly specify them:
<pre>
routes: {
    home: { view: 'index', controller: 'index' }
}
</pre>
This configuration tells the router:
* "/home" is a valid route
* The view module for this route is `app/views/IndexView.js`
* The controller for this route is `app/controllers/IndexController.js`
If your view doesn't require a custom view or controller, you can use the default modules (`mayhem/View.js` and `mayhem/Controller.js`) by explicitly specifying `null` for the `view` or `controller` property on a route.
For more complicated path matching, a route configuration also accepts a `path` property.
* `user: { path: 'user/<id:\\d+>' }`
    * This specifies that any path matching the specified pattern ("user/&lt;a sequence of decimals>") is handled by this route
    * (Note that any regular expression is valid after "\\\\")
    * The portion of the path matching "id" will be set on the `id` property of the controller's `routeInfo` property
    * For example, the path "user/1234" would be matched by this route and the controller's `routeInfo` property would have an `id` property set to "1234"
* `'contacts/contact/category': { path: '<category:friends|relatives|business>' }`
    * This will match 3 paths:
        * "contacts/contact/friends"
        * "contacts/contact/relatives"
        * "contacts/contact/business"
    * `routeInfo.category` will be set to "friends", "relatives", or "business" depending on the path
[ TODO: why does the path for user start with 'user/', but the path for "contacts/contact/category" doesn't start with 'contacts/contact/'? ]

Models
------
A Model encapsulates data, a schema, validation capabilities, and a persistence API. Application behaviors involving the Model are the responsibility of Controllers.

Mayhem's data models provide a simple and powerful way of ensuring that your data is consistent and valid. The `mayhem/Model` module provides three main configuration options to this end:
* `_schema`: defines valid field names & types. Attempts to set a value on the model that does not match the schema will fail.
* `_defaults`: defines default values for fields
* `_validators`: defines the validator functions that will run on the data before it is accepted

Example:
```javascript
define([
	'dojo/_base/declare',
	'mayhem/Model',
	'mayhem/validators/RequiredValidator'
	'mayhem/validators/DateValidator'
], function (declare, Model, RequiredValidator, DateValidator) {
	return declare(Model, {
		_schema: {
			summary: 'string',
			detail: 'string',
			dueDate: 'date'
		},

		_defaults: {
			// Default value for the model's detail property
			// NOTE: In a real application this value would be an i18n string
			detail: "No detail provided"
		},

		_validators: {
			summary: [ new RequiredValidator() ],
			dueDate: [ new DateValidator() ]
		}
	});
});
```

In your schema, in addition to specifying the data types of JavaScript primitives by name, you can also specify a constructor - this will restrict the field to values that are instances of the specified constructor.
For validation, any number of validators can be associated with each field. Mayhem provides several validator modules in the `mayhem/validator` folder that will meet most of your needs:
* `RequiredValidator` - simply checks that the field has a value
* `StringValidator` - check a string against the following options:
    * `minLength` - minimum valid length of the string
    * `maxLength` - maximum valid length of the string
    * `regExp` - a regular expression that the value must match
* `DateValidator` - checks if the value is a valid date, and supports range-checking:
    * `min` - minimum valid date
    * `max` - maximum valid date
* `NumericValidator` - checks if the value is numeric, and supports:
    * `min` - minimum valid value
    * `max` - maximum valid value
    * `integerOnly` - if true, the value must be an integer

### The Model API

// TODO: Review this for correctness.

With your schema and validators defined, be sure to use the methods provided by the `mayhem/Model` module to ensure that data is valid as it gets manipulated in the course of use. The following methods are provided:
* `set(`*`key`*`, `*`value`*`)`: set the property indicated by *key* to *value*, but only if *key* is in the schema
* `validate(`*`fields`*`)`: [*fields* is an optional array of field names to validate, defaults to all] runs the validators specified for each field and returns `false` if any fail, otherwise `true`
* `commit`: commits the current field values
* `revert`: reverts fields to currently committed values
* `save(`*`skipValidation`*`)`: save the fields to the store if they pass validation (or if *skipValidation* is `true`)
The simple example below demonstrates a model with a simple schema and a few validators. The controller module demonstrates usage of the model and its methods.
```javascript
// app/model/Person.js
define([
    'mayhem/Model',
    'mayhem/validator/RequiredValidator',
    'mayhem/validator/StringValidator',
    'dojo/store/Memory'
], function(Model, RequiredValidator, StringValidator, MemoryStore){
    return declare(Model, {
        store: new MemoryStore(),
        _schema: {
            firstName: 'string',
            lastName: 'string'
        },
        _validators: {
            firstName: [
                new RequiredValidator(),
                new StringValidator({maxLength: 120})
            ],
            lastName: [
                new RequiredValidator(),
                new StringValidator({maxLength: 120})
            ]
        }
    });
});
// app/controller/Person.js
define([
    'mayhem/Controller',
    'app/model/Person'
], function(Controller, Person){
    return declare(Controller, {
        model: new Person(),
        updatePerson: function(id, firstName, lastName){
            this.model.set({
                id: id,
                firstName: firstName,
                lastName: lastName
            });
        },
        savePerson: function(){
            var self = this;
            if(this.model.validate()){
                when(this.model.save()).then(function(){
                    self.model.commit();
                });
            }
            else{
                this.model.revert();
            }
        }
    });
});
```

Modelled Store
--------------

// TODO: Review this for errors

A model is generally backed by a store (`dojo/store/api/Store`) for data storage and persistence. Mayhem provides some common stores configured to work with models in the `mayhem/store` folder:
* `ModelledMemoryStore` for `dojo/store/Memory`
* `ModelledRestStore` for `dojo/store/JsonRest`
You can also create your own modelled stores by mixing in `mayhem/store/_ModelledStoreMixin`. A modelled store enforces the restrictions and validation provided by the model when interacting with the store. In the case of stores that depend on external sources (like `JsonRest`), this means that not only are newly created objects converted to instances of the model when they are added to the store, but also objects fetched from the server.
Using modelled stores frees you from manually calling model methods to ensure valid data. When you create the store, you specify the model it should use and from that point you can use the store API as normal, with the store internally handling validation from the model.
[ TODO: there's no evidence this is true from the code, but I hope something like this becomes true: ]
With a modelled store, the example from the previous section becomes:
```javascript
// app/controller/Person.js
define([
    'mayhem/Controller',
    'mayhem/store/ModelledMemoryStore',
    'app/model/Person'
], function(Controller, ModelledMemoryStore, Person){
    return declare(Controller, {
        store: new ModelledMemoryStore({model: Person}),
        // We now interact directly with the store so
        // there's no need for the 'updatePerson' function
        savePerson: function(id, firstName, lastName){
            // if validation is successful, the object will be put to the store and committed
            this.store.put({id: id, firstName: firstName, lastName: lastName});
        }
    });
});
```

Controllers
-----------
A controller is an encapsulation of a model and application behavior, consumed by the view template through data binding. Handling a "click" event is not part of the core domain logic, so a model would never do that. The view defines the UI and generates events, but it should not contain the code that does the real work in response to the event -- this is where the controller steps in. The controller defines event handlers that initiate an action in the model.

The controller will load the relevant model depending on its `routeState` property (which is set by the router). View templates are data bound to the controller and should update automatically in response to these changes.

Views
-----
An application's UI is a hierarchy of views with each view representing a subsection of that UI. Generally,
you will not need to extend the base `View` module, but will implement the specifics of a view in the view's HTML template.

At run-time, a `View` will have a reference to the active controller on the `controller` property.
// TODO: Confirm this.

View Templates
--------------

TODO: Add example template that shows all tags in use. Might need to be split into multiple examples, but a single example would be nice.

### <data>
The <data> tag inserts data-bound text into the DOM.

Example:
```html
<!-- This content is HTML-escaped -->
<span class="firstName"><data var="person.firstName"></span>

<!-- This content is not HTML-escaped because it is marked with a `safe` attribute -->
<span class="bio"><data var="person.bio" safe></span>
```

### <if>, <elseif>, and <else>
The <if> tag supports conditional rendering of content.

Example:
```html
<if condition="someProperty">
	someProperty is truthy
<elseif condition="anotherProperty">
	someProperty is not truthy but anotherProperty is
<else>
	No conditions were truthy
</if>
```

### <for>
The <for> tag renders content for each item in a collection.

Example:
```html
<ul>
<for each="collectionName" value="sampleItem">
	<li><data var="sampleItem.name"></li>
</for>
</ul>
```

### <when>
The <when> tag renders content according to the state of a promise.

Example:
```html
<when promise="promiseProperty" value="callbackParamName">
	The promise resolved with value: <data var="callbackParamName">
<progress>
	The promise reported progress: <data var="callbackParamName.status">
<error>
	The promise reported an error: <data var="callbackParamName">
</when>
```

### <placeholder>
The <placeholder> tag marks a place where a subview may go.
TODO: Clarify this.

Example:
```html
<placeholder name="subViewName">
```

### <widget>
The <widget> tag denotes the placement, properties, and event handlers of a widget.
A <widget> may contain child content and <widget>'s.

Example:
```html
<widget is="mayhem/Button" label="${i18n.ok}" on-click="saveModelMethodName"></widget>
```

### Binding HTML element attributes
The attributes of HTML elements can be bound to the model.

Example:
```html
<div class="employee ${person.designation}">
	...
</div>
```

### Built-in Helpers

TODO: Document more of the built-in helper functions for templates

#### createPath(routerId, routeArgs)
Creates a path to the specified route with the specified route arguments.

Example:
```html
<a href="<% router.createPath('/some/path', {param1: value}) %>">Link</a>
```

Testing
-------
TODO: We need a testing story.

Execution Walkthrough
=====================

1. The Application owns the application View, the Router, and application-wide concerns like data stores.
	1. The WebApplication module defines the default application View MID to `app/views/ApplicationView`.
	2. The application View provides the basic layout of the UI along with named placeholders for subviews associated with routes.
	3. The Router computes the `controller`, `view`, and `template` properties for each route.
		1. By default, `controller`, `view`, and `template` are assumed to be relative to the Router's
			`controllerPath`, `viewPath`, and `templatePath` properties respectively.
		2. `controller` is computed based on the following rules:
			1. If there is a leading `/`, assume an absolute MID and leave as-is
			2. If `null`, default to the core implementation `mayhem/Controller`
			3. If `undefined`, use convention based on route ID:
				(`router.controllerPath + upperCaseFirstLetter(route.id) + "Controller"`)
			4. Otherwise, compute the MID based on the value:
				(`router.controllerPath + upperCaseFirstLetter(route.controller) + "Controller"`)
		3. `view` is computed based on the following rules:
			1. If there is a leading `/`, assume an absolute MID and leave as-is
			2. If `null` or `undefined`, default to the core implementation `mayhem/View`
			3. Otherwise, compute the MID based on the value:
				(`router.viewPath + upperCaseFirstLetter(route.view) + "View"`)
		4. `template` is computed based on the following rules:
			1. If there is a leading `/`, assume an absolute MID and leave as-is
			2. If `null`, there is no default, so an exception will be thrown
			3. If `undefined`, use convention based on route ID:
				(`router.templatePath + upperCaseFirstLetter(route.id) + "View.html"`)
			4. Otherwise, compute the MID based on the value:
				(`router.templatePath + upperCaseFirstLetter(route.template) + "View.html"`)
2. On startup, the router navigates to the default route "index" and calls `enter` on the route.
	1. Entering a route instantiates its Controller and View and passes the route arguments to the Controller
		via the Controller's routeState property.
	2. The Controller is responsible for initializing its Model based on the route arguments.
	3. Access to application-wide data stores is provided to the controller via its `app` property
		(e.g., controller.app.contactStore)
	4. The View is responsible for instantiating its Template.
	5. The Template creates the DOM elements for the View and binds to the Controller
		which includes the ability to bind to the Model via the Controller's `model` property.
3. To be continued... 

