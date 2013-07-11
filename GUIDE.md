Guide to Mayhem
===============

Mayhem is a client-side framework for model-driven web applications.

The Pieces
----------

### Application
An application is an instance of the Application object and is responsible for initializing all application-level modules
(for example: the router, the main dw widget, and data stores).

### Views
Views are the UI of your application and are based on templates. Each view is bound to an underlying model,
and all fields bound to the model are two-way data bound by default. Views may contain placeholders for other views,
allowing for a hierarchy of view components.

### View Templates
View templates are written with a mix of HTML and Mayhem-specific tags including <if>, <elseif>, <else>,
<for>, <when>, <data>, and <widget>. Mayhem tags are data-bound by default.
HTML element attributes may be data-bound as well.

### Models
A Model is an observable encapsulation of information and can validate and save changes.

### Controllers
Controllers implement the application's behavior and are the bridge between models and views.

### Router
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

Putting the Pieces Together
---------------------------

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

Mangala's Notes to be Incorporated
----------------------------------
[WHY: Provide rationale/justification for why it exists, why reader should be interested]
1-3 paragraphs
* describe application structure common to many applications
* development patterns that with experience are often repeated
* Frameworks abstract out the boilerplate and provide a structure in which you just insert the code that is specific to your app
[WHAT:]
1-2 paragraphs
* what functionality is handled by the framework
* provides x, y, & z so you can focus on the code & functionality that is specific to your app
* diagram & explanation: https://projects.sitepen.com/issues/24194#note-3 (or see Dropbox/SitePen Access/Customers/ZPastCustomers/Highmark/Projects/SOW5/Deliverables/04052013HighmarkSOW5_Technical Summary.pdf)
[PRE-REQS]
* concepts reader should be familiar with (maybe some useful ref links)
* software requirements
[ SUGGESTION: some way to automate downloading deps and creating skeleton project would be nice; maybe just a repo like dbp ] a mechanism will be provided to install using a package manager and generate a skeleton project
** libraries: mayhem, dojo, ???
*** mayhem
*** dbind (https://github.com/kriszyp/dbind )
*** dijit (Q: is this absolutely necessary, or only if you're using dijit?) it is necessary for the view portion of the framework
*** dojo
*** dojox (Q: is this absolutely necessary, or only if you're using mobile/dojox?) it is necessary for the cross-platform widgets
*** put-selector (https://github.com/kriszyp/put-selector)
** server configuration: http server, any specific settings? no specific settings, same as a normal Dojo app
[HOW]
a lot of paragraphs and sub-sections
Guide will be centered around a step-by-step walkthrough of creating a simple app
1. basic file structure for starting point (no placeholders for future functionality - files will be added as needed & explained)
2. simple "Hello world" page, starting the app
2.5 Templates go somewhere, maybe here?
3. Multiple pages (routing)
4. data-driven page: model & 
5. interactive page: form & validation
6. testing
====================
# Why Project Mayhem?
[TODO: Present 1-3 lines selling _developers_ on Mayhem - keep this in sync with whatever is linked to from main project page at the "Why Mayhem?" link (replace the paragraph below]
With years of experience developing applications with the Dojo Toolkit, SitePen's developers have identified common patterns that are repeated across a variety of applications. We introduce a project that aims to reduce development time & effort by distilling the common parts into a framework, as has been done for many development environments - Django for Python, Rails for Ruby, Yii for PHP, and many others.
Web applications typically involve a common set of activities:
* TODO: there are many more features than this, update list before release with 4–8 top picks
* defining and mapping paths (URLs) to actions
* routing actions to handler functions
* mapping application objects to persistent data
* displaying, manipulating, and validating data
* updating the user interface in response to both user actions and background or 3rd-party data-related events.
When a general approach to handling these infrastructure tasks can be agreed upon, they can be handled by the framework, freeing developers to focus their efforts on the more unique aspects of the application.
[ TODO: Ensure that each section provides decent info and links along the way for people to get up to speed on relevant concepts.  Each page/section could include an intro paragraph with a list of hyperlinked concepts ]
# Features and Functionality Provided by the Framework
[GOAL: list a dozen or less top attractive features, with a brief, simple explanation that is hopefully sufficient to give a basic understanding to someone who has only a vague notion of the concept listed by name]
[ TODO: revisit this section; make it THE BEST ]
### Colin's List:
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
### Do we want anything from this list?
* Routing: you define mapping between paths and handlers; the framework matches requests to defined paths and invokes the appropriate handler [this is actually a mapping from a path to a route, and from a route identifier to a path. the route loads and executes the correct view and controller]
* Templating: you create HTML templates; the framework puts the pieces together to build the UI
* Data-binding: two-way data-binding is available in your templates; the framework handles the wiring between the UI and the model so that updates can be pushed in both directions
* Connecting your model to a persistent store
* User Authentication
* Extensible, configuration-based application instantiation
* Extensible routing
    * path-based routes
    * hierarchical routes
    * regex path declarations
* Pausable events
* Mobile interface builder
* Extensible, hierarchical views
* Templating (JSP-like syntax)
* CRUD builder widgets
* Data models
    * modeled Memory store
    * modeled JsonRest store
* Validation
    * validate data to schema defined for model
    * required, date, number, string
* Two-way data binding between View and Model
* Internationalization
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
## Understanding Mayhem's MVC Approach
[ GOAL: Talk briefly about the fundamentals of MVC, the different MVC approaches, and the specific approach that Mayhem takes ]
[ TODO: COLIN: review and revise ]
Mayhem provides a framework for and is intended to be used with applications that maintain a clear separation of concerns. You should think separately about the processes your application will perform (domain logic) and the visual interface it will provide to end users. Further, when thinking about your domain logic, you should clearly define the form of the data. When properly defined, you will have your code (and resources) split into three categories:
* Model: the core logic (domain logic) of the application and data definition
* View: the visual representation and presentation logic
* Controller: logic that binds the model and view together to create a coherent graphical application
### M - Models in MVC
Represents the core of your application &mdash; a model should provide a "headless" interface to your application. Anything your application is capable of doing should be defined in the model and exposed in a consistent, easy-to-use collection of methods that make up your application's API. The model should have no knowledge of the view and not be dependent on any code or logic from views or controllers. A view should simply be a consumer of your model's API, arbitrated by a controller.
To ensure consistent and correct data, a model should define all field names, types, and validation rules.
### V - Views in MVC
A view should only concern itself with the end-user presentation. The bulk of a view is typically HTML that simply defines the layout. Mayhem templates ease the process of creating data-driven UIs by providing syntax for:
* embedding dynamic data values in the view with two-way binding
* conditional blocks for dynamic element visibility & placement
* iteration for creating large numbers of elements from a collection of data
### C - Controllers in MVC
With the model only providing domain logic, and the view only providing presentation definition and logic, another component is required to connect the two &mdash; this is where controllers come in. When a UI event is triggered, it should have a handler defined in the controller. The controller then determines the appropriate API call to make to the model.
### Benefits of MVC
Organizing your code into these thee categories and keeping concerns cleanly separated makes it easier to:
* **understand**: the domain logic code is not littered with UI logic, so a reader can focus more easily on what's important for core domain logic
* **test**: domain logic can be tested in the absence of a UI client. Testing smaller things (is `x` equal to 10?) is always easier than testing bigger things, and extensive dependency trees can quickly turn even seemingly small things into big things.
* **debug**: a problem in the UI will lead to debugging code that only deals with the UI, while a problem in the domain logic will lead to debugging code that only deals with domain logic - there is less distraction and irrelevant code to filter out
[ TODO: COLIN: define the skeleton app. [
[ TODO: use skeleton app as basis for guide ]
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
#### Attaching Event Handlers
Event handlers can be attached to events on elements with the `data-dojo-attach-event` attribute:
<pre class="brush: html">
&lt;button type=&quot;button&quot; data-dojo-attach-event=&quot;click: update&quot;&gt;Update&lt;/button&gt;
</pre>
This would call the associated controller module's `update` method in response to the `click` event for the button.
#### Attaching Node References
Rather than searching through the DOM to find elements each time you need them, or maintaining globally unique IDs for each element that might be repeatedly referenced, you can establish references to nodes in your view with the `data-dojo-attach-point` attribute.
<pre class="brush: html">
&lt;button type=&quot;button&quot; data-dojo-attach-point=&quot;updateButton&quot;&gt;Update&lt;/button&gt;
</pre>
This results in the `updateButton` property of your view module being a reference to the DOM node for the button.
Each routing endpoint should resolve to a `mayhem/View` module. A `View` provides the visual representation for the response. The `mayhem/View` module is a general-purpose module for rendering views - combined with templating and a controller, the base module will generally meet the needs of your views.
[ TODO: how do you specify a template for `mayhem/View`? It's easy when extending `View`... but can you do it w/o creating your own custom view module? ]
[ TODO: good template example from starter app ]
In the template file [ TODO: insert path to starter app template ] you can see some of the templating syntax in action:
<pre class="brush: html">
&lt;div&gt;
    &lt;h1&gt;&lt;%! i18n.title %&gt;&lt;/h1&gt;
    &lt;div class=&quot;sidebar&quot;&gt;
        &lt;%! i18n.navigation %&gt;
        &lt;ul&gt;
            &lt;li&gt;
                &lt;a href=&quot;&lt;%= urls.renewals %&gt;&quot;&gt;
                    &lt;%! i18n.renewalsTitle %&gt;
                &lt;/a&gt;
            &lt;/li&gt;
            &lt;li&gt;
                &lt;a href=&quot;&lt;%= urls.bookOfBusiness %&gt;&quot;&gt;
                    &lt;%! i18n.bookOfBusinessTitle %&gt;
                &lt;/a&gt;
            &lt;/li&gt;
            &lt;li&gt;
                &lt;a href=&quot;&lt;%= urls.reports %&gt;&quot;&gt;
                    &lt;%! i18n.clientReportsTitle %&gt;
                &lt;/a&gt;
            &lt;/li&gt;
            &lt;li hidden=&quot;&lt;%= @!isEmployer %&gt;&quot;&gt;
                &lt;a href=&quot;&lt;%= urls.masquerade %&gt;&quot;&gt;
                    &lt;%! i18n.logInAsEmployerTitle %&gt;
                &lt;/a&gt;
            &lt;/li&gt;
        &lt;/ul&gt;
    &lt;/div&gt;
&lt;/div&gt;
</pre>
* `<% propertyName %>`: insert `viewInstance.controller.propertyName` (value will be HTML-escaped)
* `<%! propertyName %>`: insert `viewInstance.controller.propertyName` without HTML-escaping it
* `<% @propertyName %>`: insert `viewInstance.controller.propertyName` with two-way live data-binding
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
## Testing With Mayhem
A well-architected application that follow's Mayhem's MVC pattern and maintains a clean separation of concerns is much easier to test. Core domain logic can be rapidly tested in any JavaScript environment, even one without a UI. This enables you to set up a workflow where pre-commit hooks automatically test certain modules in an environment like Node or Rhino, which gives you quick results and minimal disruption to your workflow. If the tests fail, the commit can be rejected.
With the presentation layer cleanly separated from the underlying controller & model, it becomes easier to run automated in-browser testing. Web applications are often dependent on database servers and services from various other servers, even 3rd-party servers. These become easier to mock without disrupting the range or validity of possible UI states & flows.
## Templating Syntax
[ TODO: the concepts represented are more important than the actual syntax right now, we need to review the syntax to make it "better" ]
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

