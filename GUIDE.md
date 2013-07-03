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
