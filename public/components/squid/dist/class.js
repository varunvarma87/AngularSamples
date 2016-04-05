'use strict';

/*
 Class
 -----

 A class pattern, adding sugar on top of javascript prototypes

 ### Basic Usage

 var MyClass = Class.extend({
 foo: 'bar';
 });

 myInstance = new MyClass({
 hello: 'world'
 });

 console.log(myInstance.foo, myInstance.hello)

 In this example, `foo` becomes a property on `MyClass`'s prototype,
 and `hello` becomes a property on `myInstance`.

 ### Default Object Methods

 - `init()`: Called after the object is first instantiated, with all properties available

 - `get(<path>, <default>)`: Get an object an arbitrary number of levels deep, or return a default

 e.g. `myInstance.get('foo.bar.baz', 'some_default');`

 Default return value is undefined

 - `set(<path>, <value>)`: Set an object an arbitrary number of levels deep

 e.g. `myInstance.set('foo.bar.baz', 'some_value');`

 Error is thrown if no object is found to set the value on

 - `setProperties(<object>)`: Set all the properties from an object onto your object

 e.g. `myInstance.setProperties({foo: 'bar', hello: 'world'})`

 Can not be used with nested properties

 - `forEach(<callback>)`: Loop through the object and call callback(<key>, <value>) for each key/val pair

 */

define(['angular'], function (angular) {
    angular.module('squid.class', []).factory('$Class', function() {

        // Object Create
        // -------------
        //
        // Shim for Object.create, if it is not supported by our browser
        //
        // var myPrototype = {foo: 'bar'}
        // var myObject = create(myPrototype)

        // Create an empty anonymous constructor with no side effects, for re-use later
        var EmptyConstructor = function() {};

        var create = Object.create || function create(obj) {

                // Set a temporary prototype
                EmptyConstructor.prototype = obj;

                // Create an object using our temporary constructor/prototype
                var instance = new EmptyConstructor();

                // Reset the prototype for next time
                EmptyConstructor.prototype = null;

                // Return our new object, created without side effects
                return instance;
            };


        // Is Object
        // ---------
        //
        // Check of a var is an object or not
        //
        // isobject({}) -> true
        // isobject('foo') -> false

        function isobject(ob) {
            return ob && typeof ob === 'object' && ob instanceof Object;
        }


        // Transpose properties
        // -------------------------------------------------------------------
        //
        // Transpose properties from a list of objects onto a recipient object
        //
        // var recipient = {};
        // transpose(recipient, [{a: 1, b: 2}, {c: 3}])
        // recipient -> {a: 1, b: 2, c:3}

        function transpose(recipient, args) {

            // Loop through all args
            for (var i=0; i<args.length; i++) {
                var ob = args[i];

                // Ignore anything that is not an object
                if (!isobject(ob)) {
                    continue;
                }

                // Loop through all keys in our object
                for (var key in ob) {

                    // Ignore any prototypal properties
                    if (!ob.hasOwnProperty(key)) {
                        continue;
                    }

                    var item = ob[key];

                    // Give the function a name
                    if (typeof item === 'function') {
                        item.__name__ = key;
                    }

                    recipient[key] = item;
                }
            }
        }


        // Construct a Class
        // -----------------
        //
        // This is the primary constructor for all $Class objects

        function construct() {

            // Call any custom constructor;
            if (this.construct) {
                var ob = this.construct.apply(this, arguments);

                // If we get a new object back, return that to the user
                if (isobject(ob)) {
                    return ob;
                }
            }

            // Load any provided properties directly onto the object
            transpose(this, arguments);

            // Initialize the object
            if (this.init) {
                this.init();
            }
        }


        // Reopen an object
        // ----------------
        //
        // Add properties to the constructor's prototype
        //
        //     var Animal = $Class.extend();
        //
        //     Animal.reopen({
        //       type: 'animal',
        //     });
        //
        //     var cat = new Animal;
        //     console.log(cat.type);


        function reopen() {

            // Add some more properies to our prototype
            transpose(this.prototype, arguments);

            return this;
        }



        // Reopen a class
        // --------------
        //
        // Add properties to the constructor. These will propogate through future extends
        //
        //     var Animal = $Class.extend();
        //
        //     Animal.reopenClass({
        //       fromCache: function(id) {
        //         return cache[id] || new this({id: id});
        //       }
        //     }
        //
        //     var cat = Animal.fromCache('cat_54');

        function reopenClass() {

            // Add some more properies to our class
            transpose(this, arguments);

            // Add to __classmethods__
            transpose(this.__classmethods__, arguments);

            return this;
        }



        // Generate a new class
        // --------------------
        //
        // Generate a new constructor, with the specified name, and attach all static and prototypal methods

        function extend(name) {

            var Cls, className, args;

            // Accept an optional class name
            if (typeof name === 'string') {

                // Guard against javascript injection
                if (!name.match(/^[\w\d]+$/)) {
                    throw new Error('Class name can not include special characters: ' + name);
                }

                // Use the provided name and slice out the first argument
                className = name;
                args = Array.prototype.slice.call(arguments, 1);
            }
            else {

                // Otherwise default to the parent name, or 'Object' if generating our first class
                className = this.name || 'Object';
                args = arguments;
            }

            // Dynamically create our constructor with a custom name
            eval('Cls = function ' + className + '() { return construct.apply(this, arguments) }');

            // Store the class name for future reference
            Cls.__name__ = className;

            // Set up a classmethods object. These will be inherited through subsequent extend() calls
            Cls.__classmethods__ = {
                extend: extend,
                reopen: reopen,
                reopenClass: reopenClass
            }

            // If we're being called on an existing class, e.g. Class.extend(), we should inherit from that class
            if (this && this !== window) {

                // Inherit everything from superclass prototype
                Cls.prototype = create(this.prototype);

                // Re-set the constructor, which is overwritten by create
                Cls.prototype.constructor = Cls;

                // Add a reference to the superclass prototype for super method calls
                Cls.prototype._super = this.prototype;

                // Inherit any class methods from the superclass
                angular.extend(Cls.__classmethods__, this.__classmethods__);
            }

            // Add the class methods to our existing class
            angular.extend(Cls, Cls.__classmethods__);

            // Load any provided properties onto the constructor's prototype
            transpose(Cls.prototype, args);

            // Temporary: allow access from console/debugger
            window['$' + className] = Cls;

            return Cls;
        }


        // Multi-layer get
        // ---------------
        //
        // Recursively gets a deep path from an object, returning a default value if any level is not found
        //
        // var obj = {bar: {baz: 1}}
        // get(obj, 'bar.baz', 'default') -> 1
        // get(obj, 'aaa.bbb', 'default') -> default

        function get(item, path, def) {

            path = path.split('.');

            // Loop through each section of our key path
            for (var i=0; i<path.length; i++) {

                // If we have an object, we can get the key
                if (isobject(item)) {
                    item = item[path[i]];
                }

                // Otherwise, we should return the default (undefined if not provided)
                else {
                    return def;
                }
            }

            // If our final result is undefined, we should return the default
            return item === undefined ? def : item;
        }


        // Multi-layer set
        // ---------------
        //
        // Recursively sets a deep path from an object
        //
        // var obj = {bar: {baz: 1}}
        // set(obj, 'bar.baz', 2)
        // obj.bar.baz -> 1

        function set(item, path, value) {
            path = path.split('.');

            // Loop through each section of our key path except the last
            for (var i=0; i<(path.length-1); i++) {

                // Get the next item down
                item = item[path[i]];

                // If we have an object, we're good
                if (isobject(item)) {
                    continue;
                }

                // Otherwise, there's nothing to set our key on
                else {
                    throw new Error(path[i-1] + '.' + path[i] + ' is not an object');
                }
            }

            // Do the set on the retrieved object with our value
            item[path[path.length-1]] = value;
        }


        // Loop through object
        // -------------------
        //
        // Loop an object and apply a function for each key/value
        //
        // var ob = {a: 1, b: 2, c: 3}
        // each(ob, console.log) -> a 1  b 2  c 3

        function each(ob, callback) {
            for (var key in ob) {
                if (ob.hasOwnProperty(key)) {
                    callback.call(ob, key, ob[key]);
                }
            }
        }


        // Gey keys of object
        // ------------------
        //
        // Shim for Object.keys if it does not already exist
        //
        // var ob = {a: 1, b: 2, c: 3}
        // keys(ob) -> ['a', 'b', 'c']

        function keys(ob) {

            if (Object.keys) {
                return Object.keys(ob);
            }

            var result = [];

            for (var key in ob) {
                if (ob.hasOwnProperty(key)) {
                    result.push(key);
                }
            }

            return result;
        }


        // Create a base class that can be inherited from
        // ----------------------------------------------
        //
        // This is the public interface to the Class module.
        // All classes with extend from Class and be provided with a set of base convenience methods.

        var $Class = extend('Class', {

            init: function() {
                // Empty init class, so calls to _super can be safely made
            },

            get: function(path, def) {
                return get(this, path, def);
            },

            set: function(path, value) {
                set(this, path, value);
            },

            setProperties: function() {
                transpose(this, arguments);
            },

            forEach: function(callback) {
                each(this, callback);
            },

            keys: function() {
                return keys(this);
            }
        });

        $Class.get  = get;
        $Class.set  = set;
        $Class.keys = keys;

        return $Class;

    });
});
