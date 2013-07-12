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

Obtaining Mayhem
================

TODO: Provide automated way to obtain the framework

Dependencies
------------
* mayhem
* dbind
* dijit
* dojo
* dojox


Reference
=========

The Shape of an Application
---------------------------

TODO: Directory structure and minimum modules for a viable app. Both currently outlined in the tutorial.

Application Configuration
-------------------------

TODO: Mention the modules property and the fact that the `ui` and `router` are staples

The Router
----------

Controllers
-----------

Views
-----

View Templates
--------------

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

Testing
-------
TODO: We need a testing story.

# Creating an Application With Mayhem
## Setting Up Your Project
1. Download and extract the complete package [TODO: add link] into your project folder
2. At the command line in your project folder run `cd mayhem`
3. Run `grunt generate app` [TODO: put actual command]
This will create a new `app` package in the project directory that provides a starting application.
The archive also contains the other open-source Dojo Foundation libraries that Mayhem is built with:
* dbind (https://github.com/kriszyp/dbind )
* dgrid (https://github.com/SitePen/dgrid )
* dijit (https://github.com/dojo/dijit )
* dojo (https://github.com/dojo/dojo )
* dojox (https://github.com/dojo/dojox )
* put-selector (https://github.com/kriszyp/put-selector )
* xstyle (https://github.com/kriszyp/xstyle )
Your project structure should look like this:
[ TODO: update with files included in starter app ]
<pre>
/
    app/
    dbind/
    dgrid/
    dijit/
    dojo/
    dojox/
    mayhem/
    put-selector/
    xstyle/
    index.html
</pre>
Open your browser and navigate to http://localhost/&lt;project-folder&gt;/index.html to see your application running.

## Exploring the Starter Application
Walking through the starter application will give you a good understanding of the main components that make up a Mayhem application:
* Application View
* Application
* Router
* View
* Controller
* Model
* Store
### Application View
`app/views/ApplicationView` is the top-level module that contains your application. Individual views are loaded into the application view. For example, if your application has a common header and footer, these would be defined in your application view. The application view can be templated.
### Application
The `mayhem/Application` module is the top-level framework component for your application. For web applications, you will generally use `mayhem/WebApplication` (which extends `mayhem/Application`).
To see basic usage of this module, look in `index.html` and `app/main.js`.
`index.html` is very simple - it just defines the packages and loads `app/main.js`:
<pre>
&lt;script>
    var dojoConfig = {
        async: true,
        baseUrl: '.',
        deps: [ 'app/main' ],
        packages: [
            'app',
            'dojo',
            'dijit',
            'dojox',
            'dbind',
            'dgrid',
            'mayhem',
            'put-selector',
            'x-style'
        ],
        tlmSiblingOfDojo: false
    };
&lt;/script>
&lt;script src="dojo/dojo.js">&lt;/script>
</pre>
`app/main.js` is also very simple - it loads the configuration and passes it to a new instance of `mayhem/WebApplication`:
<pre class="brush: js">
define([
    'mayhem/WebApplication',
    './configurations/main'
], function (WebApplication, config) {
    var app = new WebApplication(config);
    app.startup();
    return app;
});
</pre>
<div class="hot-topics">
    <ul>
        <li><a href="http://dojotoolkit.org/documentation/tutorials/1.9/modules">AMD</a> - keeping your JavaScript modular</li>
        <li><a href="http://dojotoolkit.org/documentation/tutorials/1.9/dojo_config">Configuring Dojo</a>
    </ul>
</div>
#### Configuration
The starter app includes the following configuration (`app/configurations/main.js`):
[ TODO: put configuration from starter app here and explain it ]
<pre class="brush: js">
define([
    '../components/User'
], function (User) {
    return {
        brandName: 'My App',
        modules: {
            router: {
                controllerPath: 'app/controllers',
                viewPath: 'app/views',
                routes: {
                    'index': {},
                    'test': {
                        view: 'index',
                        controller: 'index',
                        path: 'test/&lt;id:\\d+>'
                    },
                    'clients/renewals': {},
                    'clients/renewals/search': {},
                    'contacts': { view: null, controller: null },
                    'contacts/contact': {
                        view: null,
                        controller: null,
                        path: '&lt;id:\\d+>'
                    },
                    'contacts/contact/category': {
                        view: null,
                        controller: null,
                        path: '&lt;category:friends|relatives|business>'
                    },
                    'static': { path: 'static/&lt;page:\\w+>' }
                },
                defaultRoute: 'index'
                notFoundRoute: 'error'
            },
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
</pre>
The main important settings here are:
* `modules.router`: this configuration will be passed to a `mayhem/routing/Router` module
* `modules.router.controllerPath`: the location of your custom controller modules
* `modules.router.viewPath`: the location of your custom view modules
* `modules.router.routes`: this object defines all of the routes for your application
* `modules.router.defaultRoute`: the default route when the application is loaded with no path specified
* `modules.router.notFoundRoute`: the view to load when a path is specified that does not match any of the routes
* `modules.user`: the module that will handle authentication & related settings
Arbitrary properties, like `brandName`, can also be set on the configuration. All properties will be set on your `mayhem/Application` instance (which is loaded in `app/main`), so any module that loads `app/main` will be able to access them.
The options set in your configuration will be in effect for the lifetime of the application.
### Router
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
### View
A Mayhem view is defined in an HTML template. The `mayhem/View` module loads the template and provides a reference to the controller, but you will generally not need to extend the base `View` module. The view's controller should handle responding to view events and calling the necessary methods on the model.
At run-time, a `View` will have a reference to the active controller on the `controller` property.

### Controller
A controller is the arbiter of flow between views and models. Handling a "click" event is not part of the core domain logic, so a model would never do that. The view defines the UI and generates events, but it should not contain the code that does the real work in response to the event &mdash; this is where the controller steps in. The controller defines event handlers that initiate an action in the model. Event handlers are often very brief functions that directly defer the heavy lifting to the model.
Similarly, a model may have a data store that is observable. The model should not include presentation logic, so it will not directly observe its own store and manipulate the UI. Instead, the controller should register an observer on the model and send requests to the view to update the presentation. This is the beauty of observable objects - they bring the event-driven nature of UI elements to back-end objects, enabling us to decouple the domain logic from the presentation logic. The controller sits in the middle and provides listeners for UI events and registers observers on relevant objects in the model.
The controller will load the relevant model depending on its `routeState` property (which is set by the router).
<div class="hot-topic">
    <ul>
        <li>Inheritance with <a href="http://dojotoolkit.org/documentation/tutorials/1.9/declare"><code>declare</code></a></li>
        <li><a href="http://dojotoolkit.org/documentation/tutorials/1.9/realtime_stores/">Real-time Stores</a></li>
    </ul>
</div>
### Model
The model contains your application's core domain logic. When designing your model, you should think of it as the API to your application. For example, if your application involves adding a record, it should be a method on the model. UI structure and presentation logic should strictly be kept out of your model. To this end, Mayhem's models *do not* have a reference to an associated view or controller, and if you find yourself inclined to add one, you should carefully reconsider your architecture and ensure that you are maintaining an appropriate separation of concerns.
Your model modules taken as a whole should provide a functional basis for your application (albeit, an application that lacks an end-user interface; it provides only a programmatic interface). This programmatic interface, your application's API, can then be used by any end-user interface you design, whether it's a web application, command-line interface, or something else.
The architecture of your domain logic should not be coupled to the architecture of your UI, so don't feel compelled to create a 1:1 mapping of model modules to view modules. You should separate core functionality into model modules in a way that makes sense for the application. For example, operations on a `User` object might be defined in a `User` model, while operations on an `Event` (event here referring to a scheduled event in the physical world) might be defined in an `Event` model. Your UI may end up logically having separate `User` and `Event` views which would load the associated controllers & models, but it's also likely to end up with a view that involves both `User` and `Event`-related actions &mdash; this view's controller would load both the `User` and `Event` models. It's better to create an internally consistent and logical API for your model and then load whatever models are relevant for each controller than to create a disjointed internal API simply to attempt to match up model modules 1:1 with view modules.
Mayhem's data models provide a simple and powerful way of ensuring that your data is consistent and valid. The `mayhem/Model` module provides three main configuration options to this end:
* `_schema`: defines valid field names & types. Attempts to set a value on the model that does not match the schema will fail.
* `_defaults`: defines default values for fields
* `_validators`: defines the validator functions that will run on the data before it is accepted
Let's look at the model for our starter application in `app/model/ToDo.js` [ TODO: use real module path ]:
[ TODO: put the real model here ]
<pre class="brush: js">
{
    _schema: {
        id: "number",
        title: "string",
        description: "string",
        dueDate: Date,
        estimatedHours: "number",
        isComplete: "boolean"
    },
    _defaults: {
        id: null,
        title: "Untitled",
        description: "",
        dueDate: null,
        estimatedHours: null,
        isComplete: false
    },
    _validators: {
        title: [
            new RequiredValidator(),
            new StringValidator({ maxLength: 30 })
        ],
        description: [ new RequiredValidator() ],
        dueDate: [
            new RequiredValidator(),
            new DateValidator({ min: new Date(), scenarios: [ "insert" ] })
        ],
        estimatedHours: [
            new NumericValidator({ min: 0, max: 8, allowEmpty: true })
        ]
    }
}
</pre>
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
#### Using Mayhem's Model API
With your schema & validators defined, you need to be sure to use the methods provided by the `mayhem/Model` module to ensure that data is valid as it gets manipulated in the course of use. The following methods are provided:
* `set(`*`key`*`, `*`value`*`)`: set the property indicated by *key* to *value*, but only if *key* is in the schema
* `validate(`*`fields`*`)`: [*fields* is an optional array of field names to validate, defaults to all] runs the validators specified for each field and returns `false` if any fail, otherwise `true`
* `commit`: commits the current field values
* `revert`: reverts fields to currently committed values
* `save(`*`skipValidation`*`)`: save the fields to the store if they pass validation (or if *skipValidation* is `true`)
The simple example below demonstrates a model with a simple schema and a few validators. The controller module demonstrates usage of the model and its methods.
<pre class="brush: js">
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
</pre>
### Store
A model is generally backed by a store (`dojo/store/api/Store`) for data storage and persistence. Mayhem provides some common stores configured to work with models in the `mayhem/store` folder:
* `ModelledMemoryStore` for `dojo/store/Memory`
* `ModelledRestStore` for `dojo/store/JsonRest`
You can also create your own modelled stores by mixing in `mayhem/store/_ModelledStoreMixin`. A modelled store enforces the restrictions and validation provided by the model when interacting with the store. In the case of stores that depend on external sources (like `JsonRest`), this means that not only are newly created objects converted to instances of the model when they are added to the store, but also objects fetched from the server.
Using modelled stores frees you from manually calling model methods to ensure valid data. When you create the store, you specify the model it should use and from that point you can use the store API as normal, with the store internally handling validation from the model.
[ TODO: there's no evidence this is true from the code, but I hope something like this becomes true: ]
With a modelled store, the example from the previous section becomes:
<pre class="brush: js">
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
</pre>
<div class="hot-topic">
    <ul>
        <li><a href="http://dojotoolkit.org/documentation/tutorials/1.9/intro_dojo_store/">Dojo Object Store</a></li>
    </ul>
</div>

### Links
`<a href="<% router.createPath('/some/path', {param1: value}) %>">Link</a>`
### Variables
* Variables are looked up on the `viewModel` property of the View (NOTE: `viewModel` is the "controller", the property name and our terminology will eventually align).
* by default, all variables are HTML-escaped
* whitespace before/after a variable should not be significant (except that currently it is eg `<%!something%>`)
* combinations should be allowed - eg a bound, unescaped, negated variable `<%! @!something %>`
* TODO: what about promises?
An Unbound Variable
```
<% item.prop %>
```
An Unescaped Variable
```
<%! item.prop %>
```
A Bound Variable (NOTE: bound variables might be the more common case and so maybe they should be the default and unbound should have some specific syntax?)
```
<% @item.prop %>
```
A Negated/Inverse Variable (NOTE: this syntax is potentially ambiguous when you consider that `<%! item.prop %>` is the syntax for unescaped text)
```
<% !item.prop %>
```
### Blocks
* blocks should have a way to match opening and closing tags
TODO: i don't have blocks yet but the concepts should be:
Iterative Blocks
```
<%= forEach item index list %>
  <li>some repeated <%item.thing%></li>
<%/forEach%>
```
Conditional Blocks
```
<%= if some.value %>
  ...
<%= else %>
  ...
<%/if%>
```
Async Blocks (NOTE: i don't really mean for `...` to be the syntax, i just don't know what it should be)
```
<%= ... some.promise %>
  There should be a block for when the promise resolves
<%= otherwise %>
  There should be a block for when the promise is rejected
<%= ... %>
  There should be a block for when we're waiting on the promise
<%/...%>

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

