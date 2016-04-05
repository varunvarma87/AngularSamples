angularTaxId
============

Tax ID CRUD with angularjs

# Setting up the app
1. git clone https://github.paypal.com/vmoses/angularTaxId.git
2. npm install
3. bower update
4. grunt build (or) grunt content
5. node .
6. http://localhost:8007/angularTaxId/TaxIdNg

# Explanation
1. Angular templates are in /public/pages
2. All angular html/ tags/ directives should be inside script tag so that browser does not render it before angular kickstarts.
3. Angular module is in /public/js/app.js. 
4. A couple of angular service is defined (factory) - TaxIds to do the ajax call to get tax ids and TaxIdStore as a local store of the retrieved tax ids.
5. The tax id list page and add/change page have their own controllers. All data (variables and functions) set in $scope in these controllers are available to be accessed in the templates.
6. In /public/pages/taxidAdd.html, the input tag is specified with ng-model="taxid.actualValue" so when user types into the textbook, the taxid.actualValue will automatically change (data binding)
7. The ng app has a config which defines the routes and corresponding controller and template. The template is downloaded as and when needed.
8. Localisation is achieved via
	1. A grunt-content-json task (installed via npm install) which will read properties files and generate US/en.js and US/en.json for each country and lang.
	2. Dust template which will insert the correct country/lang file into the html.
	3. A global addContent function which will just save the content into a global variable loccontent.
	4. A getContent function in the rootScope of angular which can be accessed via angular expressions. https://github.paypal.com/vmoses/angularTaxId/blob/angular/public/js/app.js#L142

# Localisation (in detail)
1. Step 1: Generating the JS file from properties file - 1 each for country+lang
	+ Install grunt-content-json npm module https://github.paypal.com/NodeXOShared/grunt-content-json
	+ This has a grunt task for generating JS files from properties files
	+ Configure this task by providing source and destination https://github.paypal.com/vmoses/angularTaxId/blob/angular/tasks/content-json.js
	+ `src:"locales"`
	+ `dest:".build/locales"`
	+ Running this task will read all files from /locales/__country__/__lang__/\*\*/*.properties and write files /.build/locales/__country__/__lang__.js
	+ A sample file is here - https://github.paypal.com/vmoses/angularTaxId/blob/angular/samples/en.js
	+ The JS file will contain all key value pairs of all properties files for a country+lang combination as a JSON object
	+ Also the JSON object will be wrapped around a javascript function call `addContent(country, lang, JSON);`
2. Step 2: Insert the correct country+lang JS file in the page for a request
	+ This is done via context.locality in the dust template
	+ https://github.paypal.com/vmoses/angularTaxId/blob/angular/public/templates/layouts/angmaster.dust#L26
	+ Dust is used here so that the country and lang specific file is inserted on the server side and there is no logic to detect this in the client side
3. Step 3: Define the addContent function needed to use the generated JSON object
	+ A global function `addContent` is defined which will store the JSON object into a global variable `loccontent`
	+ https://github.paypal.com/vmoses/angularTaxId/blob/angular/public/templates/layouts/angmaster.dust#L22
4. Step 4: Define a function to access the stored JSON object and retrieve the value for a key
	+ A `getContent` function is defined in the angular rootScope so it can be accessed by any code
	+ https://github.paypal.com/vmoses/angularTaxId/blob/angular/public/js/app.js#L143
	+ The function takes a key (same as key defined in properties file) as input and returns the corresponding value from the `loccontent` global JSON object.
5. Step 5: Use the getContent function to get strings from properties files (which is in JSON) in our angular template and javascript
	+ A simple function call (since the function is in angular rootScope) will suffice to get the value for a key.
	+ Usage in angular template: https://github.paypal.com/vmoses/angularTaxId/blob/angular/public/pages/taxids.html#L2
	+ If this is needed in javascript code, the function can be called in the same way.

# Caveats
1. The app still uses dust templating for setting country and language in the html.
2. Csrf is disabled in config.son till I figure out how to add this to the form.
3. Angular delimiters are changed from {{ }} to [[ ]] so that there is no confusion with dust.
4. A global variable (loccontent) and a global function (addContent) are introduced. Should ideally be namespaced so it does not pollute the global namespace.

