/*global define:false*/

(function (window, undefined) {
    'use strict';

    var ENTITY_TABLE = { 'lt' : 60, 'gt' : 62, 'amp' : 38, 'quot' : 34 };

    /**
     * Determines if the provided object is an Array
     * @param  {Object}  obj the potential Array
     * @return {Boolean}     true if the provided object is an Array, or false if not
     */
    function isArray(obj) {
        return Array.isArray ? Array.isArray(obj) : Object.prototype.toString.call(obj) === "[object Array]";
    }


    /**
     * [before description]
     * @param  {[type]} object  [description]
     * @param  {[type]} method  [description]
     * @param  {[type]} handler [description]
     * @return {[type]}         [description]
     */
    function before(object, method, handler) {
        var original = object[method];
        object[method] = function () {
            handler(arguments);
            original.apply(object, arguments);
        };
    }

    /**
     * [after description]
     * @param  {[type]} object  [description]
     * @param  {[type]} method  [description]
     * @param  {[type]} handler [description]
     * @return {[type]}         [description]
     */
    // function after(object, method, handler) {
    //     var original = object[method];
    //     object[method] = function after() {
    //         var retval = original.apply(object, arguments);
    //         handler(arguments, retval);
    //         return retval;
    //     };
    // }

    /**
     * Traverses content aliases to determine if the key has been mapped
     * previously
     * @param  {Object} alias [description]
     * @param  {String} key   [description]
     * @return {Boolean}      [description]
     */
    function containsKey(alias, key) {
        while (alias) {
            if (alias.keys.hasOwnProperty(key)) {// && alias.bundles[alias.keys[key]] === key) {
                return true;
            }
            alias = alias.tail;
        }
        return false;
    }

    /**
     * Searches the context for content bundle prefixes for the provided key
     * @param  {String} key     the key for which to find the bundle prefix
     * @param  {Object} context a DustJS Context object
     * @return {String}         the bundle prefix (e.g. {appName}.{bundleName}) or undefined if not found
     */
    function findNameMapping(key, context) {
        var stack = context.stack,
            alias = null;

        // TODO - Can't assume there's a stack. Not sure what else to do.
        while (stack) {
            if (stack.isObject) {
                alias = stack.head.$alias;
                while (alias && alias.keys) {
                    if (alias.keys.hasOwnProperty(key)) {
                        return alias.bundles[alias.keys[key]];
                    }
                    alias = alias.tail;
                }
            }
            stack = stack.tail;
        }

        return undefined;
    }


    /**
     * Attempts to get the value for the key from the provided context, but also
     * digs around for some magic values to try to resolve the mess.
     * @param  {[type]} key     [description]
     * @param  {[type]} context [description]
     * @return {[type]}         [description]
     */
    function getValueForKey(key, context) {
        var value, len, current;

        if (key in context) {
            value = context[key];

        } else if (isArray(context)) {
            // See if the context is one of our special array/object data structures
            len = context.length;
            while (len--) {
                current = context[len];
                // Fail fast if the object doesn't have $id, because none of them will
                if (!('$id' in current) || current.$id === key) {
                    // value could be undefined
                    value = current.$elt;
                    break;
                }
            }

        } else if (context.$elt && key.charAt(1) !== "$") {
            // If there's a magic $elt property at this level and the key isn't special...
            // ...use the magical $elt property instead of the current context
            value = context.$elt[key];
        }

        return value;
    }


    /**
     * Searches the global content hierarchy for a value at the provided key.
     * A key can be either a shortname plus key (e.g. alias:myContent) or a fully
     * qualified namespace (e.g. appName.bundleName.myContent)
     * @param  {String} key     the key to look for
     * @param  {Object} context the context object to traverse to lookup the alias => bundle mapping
     * @return {Object}         The found content string.
     */
    function getValueForContentKey(key, context) {
        if (!key) { return; }
        var alias = key.split(':'),
            namespace = null,
            object = null,
            i = 0, length;

        if (alias.length > 1) {
            // The provided key is a alias prefixed, so we need to lookup the
            // appName/bundleName combo provided by a useContext helper and expand
            // our key to the full namespace by appending the remaining portion
            // Example: alias:key => appName.bundleName.key
            key = findNameMapping(alias[0], context) + '.' + alias[1];
        }

        // Grab the content root (appName) off the global context
        object = context.global.cn;

        // Break our full dot-delimited package name into a namespace
        namespace = key.split('.');
        length = namespace.length;

        // Continue through the packages, descending until we reach a leaf node
        // http://jsperf.com/descending-object-heirarchies
        while (i < length && object) {
            // TODO: Deal with subscripts
            object = getValueForKey(namespace[i++], object);
        }

        // TODO: Throw error or allow undefined to be returned?
        // TODO: Does the $elt prop need special treatment? If there's the magic $elt
        // property, return that. Otherwise, give back the leaf.
        return object;

    }



    /**
     * Implementation of dust helper API. Accepts a dust object which it uses to merge helpers.
     * @param  {Object} dust the dust object to extend
     */
    function extend(dust) {

        var helpers = dust.helpers = (dust.helpers || {});

        /**
         * A helper that's use to setup aliases/shortnames for content bundles. e.g. you can use cn to refer to appName.bundleName in
         * content helpers used within the useContent context.
         *
         * @param  {Object} chunk   A Chunk is a Dust primitive for controlling the flow of the template. Depending upon
         *                          the behaviors defined in the context, templates may output one or more chunks during
         *                          rendering. A handler that writes to a chunk directly must return the modified chunk.
         * @param  {Object} context the current context stack
         * @param  {Object} bodies  The bodies object provides access to any bodies defined within the calling block.
         *                          e.g. {:else} in {#guide}foo{:else}bar{/guide}
         * @param  {Object} params  The params object contains any inline parameters passed to a section tag
         * @return {Object}         the original chunk if not written to, or the chunk resulting from n write operations.
         */
        helpers.useContent = function (chunk, context, bodies, params) {
            // TODO - Can't assume there's a stack. Not sure what else to do.
            var head = context.stack && context.current(),
                alias, keys, bundles, pairs, count, pair, props, prop, value;

            if (!head) {
                context.rebase({});
                head = context.current();
            }

            alias = head.$alias = { keys: {}, bundles: [], tail: head.$alias };
            keys = alias.keys;
            bundles = alias.bundles;

            pairs = params.map.split(',');
            count = pairs.length;
            props = [];

            while (count--) {
                pair = pairs[count].split('=');
                if (pair.length !== 2 || (pair[1].indexOf('.') === -1)) {
                    continue;
                }

                prop = pair[0];
                value = pair[1];

                if (!keys.hasOwnProperty(prop)) {
                    if (keys.hasOwnProperty(value)) {
                        keys[prop] = keys[value];
                    } else {
                        keys[prop] = keys[value] = bundles.length;
                        bundles.push(value);
                        props.push(prop);
                    }
                }
            }

            // Only aggregate content bundles if content isn't available
            if (!context.global.cn) {
                before(chunk.root, 'callback', function chunkComplete() {
                    // It's magic time. This callback will either get an 'arguments' object
                    // passed to it directly or get invoked with the normal, expected arguments.
                    // We add a 3rd argument to the arguments object to add metadata about the
                    // template aggregation. In this case we're adding content bundle data.
                    var args, metadata;

                    args = arguments.length > 1 ? arguments : arguments[0];
                    args.length = 3;

                    metadata = args[2] = (args[2] || {});
                    metadata.bundles = (metadata.bundles || []).concat(head.$alias.bundles);

                    if (head.$alias.tail) {
                        head.$alias = head.$alias.tail;
                    } else {
                        delete head.$alias;
                    }
                });
            }

            // Process the body, consuming the _useContent map we just generated
            // @see findNameMapping()
            chunk = bodies.block(chunk, context);

            return chunk;
        };


        /**
         * Digest a v4 content list. Has limited utility.
         * Attributes:
         *  - $key (or 'items')
         *  - start (optional)
         *  - end (optional)
         *  - step (optional)
         *
         * @param  {Object} chunk   A Chunk is a Dust primitive for controlling the flow of the template. Depending upon
         *                          the behaviors defined in the context, templates may output one or more chunks during
         *                          rendering. A handler that writes to a chunk directly must return the modified chunk.
         * @param  {Object} context the current context stack
         * @param  {Object} bodies  The bodies object provides access to any bodies defined within the calling block.
         *                          e.g. {:else} in {#guide}foo{:else}bar{/guide}
         * @param  {Object} params  The params object contains any inline parameters passed to a section tag
         * @return {Object}         the original chunk if not written to, or the chunk resulting from n write operations.
         */
        helpers.contentList = function (chunk, context, bodies, params) {
            // Get $key or list properties to determine correct list to grab from content payload.

            var key = ('$key' in params) ? helpers.tap(params.$key, chunk, context) : helpers.tap(params.items, chunk, context),

                // The actual content object we're going to use. In this case, hopefully it's an Array.
                value = getValueForContentKey(key, context),

                // Variable used to communicate index during iteration. Zero-based. Preserving 'var' for backward-compatibility
                // but moving to idx to preserve consistency across Dust APIs
                iter = ('var' in params) ? helpers.tap(params['var']) : 'idx',

                // the default (unnamed) block
                body = bodies.block,

                i = 0, len = 0, derived, text, property;

            if (isArray(value)) {
                if (body) {
                    len = value.length;
                    for (; i < len; i++) {
                        text = value[i];

                        // 'var' legacy support
                        // use idx, $idx (undocumented so YMMV) or {@idx}{.}{/idx} for this value if you NEED
                        // the current iteration index.
                        context.stack.head[iter] = i;

                        // XXX - This is really inefficient
                        // This step add support for named values to use during content interpolation, e.g.
                        // {@contentList $key="foo" stuff="{stuff}"} {!$id or $elt get value 'stuff' replaced !} {/contentList}
                        for (property in params) {
                            if (params.hasOwnProperty(property) && property.charAt(0) !== '$') {
                                // Not a 'special' property (e.g. $key), so get the value, and simulate
                                // dust interpolation
                                derived = helpers.tap(params[property], chunk, context);
                                text.$id = text.$id.replace('{' + property + '}', derived);
                                text.$elt = text.$elt.replace('{' + property + '}', derived);
                            }
                        }

                        // body here is the default (unnamed) block
                        chunk = body(chunk, context.push(text, i, len));
                    }
                }
            }

            return chunk;
        };


        /**
         * Output the content for the provided key. Will also perform interpolation using the optional
         * value attributes.
         *
         * @param  {Object} chunk   A Chunk is a Dust primitive for controlling the flow of the template. Depending upon
         *                          the behaviors defined in the context, templates may output one or more chunks during
         *                          rendering. A handler that writes to a chunk directly must return the modified chunk.
         * @param  {Object} context the current context stack
         * @param  {Object} bodies  The bodies object provides access to any bodies defined within the calling block.
         *                          e.g. {:else} in {#guide}foo{:else}bar{/guide}
         * @param  {Object} params  The params object contains any inline parameters passed to a section tag
         * @return {Object}         the original chunk if not written to, or the chunk resulting from n write operations.
         */
        helpers.content = function (chunk, context, bodies, params) {

            // This resolves any dynamic values e.g. {foo} as the key
            var tap = helpers.tap,
                key = tap(params.$key, chunk, context),
                value = getValueForContentKey(key, context),
                property = null,
                derived = null;


             var head = context.stack && context.current(),
                 alias, namespace;

            // TODO: This is kinda fugly
            // Only aggregate content bundles if content isn't available
            if (!context.global.cn && key.indexOf(':') === -1) {
                // If a colon is there the content has already been handled
                // because it's a reference to a content alias (via @useContent)
                alias = head.$alias;
                namespace = key.substring(0, key.lastIndexOf('.'));

                before(chunk.root, 'callback', function () {
                    // It's magic time. This callback will either get an 'arguments' object
                    // passed to it directly or get invoked with the normal, expected arguments.
                    // We add a 3rd argument to the arguments object to add metadata about the
                    // template aggregation. In this case we're adding content bundle data.
                    var args, metadata;

                    if (alias && !containsKey(alias, namespace)) {
                        args = arguments.length > 1 ? arguments : arguments[0];
                        args.length = 3;

                        metadata = args[2] = (args[2] || {});
                        metadata.bundles = (metadata.bundles || []);
                        metadata.bundles.push(namespace);
                    }
                });
            }

            if (value) {
                // Now that we have a value, we have to manually do interpolation
                // for patterns {foo}. (This fakes out actual dust replacement.)
                for (property in params) {
                    if (params.hasOwnProperty(property) && property.charAt(0) !== '$') {
                        // Not a 'special' property (e.g. $key), so get the value, and simulate
                        // dust interpolation
                        derived = tap(params[property], chunk, context);
                        value = value.replace('{' + property + '}', derived);
                    }
                }

                // Support 'html' and 'text' mode. Essentially, this means if it's tagged as 'text' it'll try
                // to strip HTML if possible, and if 'html' it'll convert escaped entities to valid characters.
                // This feels like it could be abused.
                switch (params.mode) {
                    case 'text':
                        // TODO: This seems fishy. No time to monkey with it now, though.
                        value = value.replace(/&lt;(.|\n)*?&gt;/g, '');
                        break;

                    case 'html':
                        // Replace necessary entities, such as &gt; with their character counterparts
                        value = value.replace(/\&(\w{0,7});/g, function (match, capture, offset, string) {
                            return String.fromCharCode(ENTITY_TABLE[capture]);
                        });
                        break;
                }

                chunk = chunk.write(value);
            }

            return chunk;
        };


         /**
         * Output the substring of the content for the provided in str.
         *
         * @param  {Object} chunk   A Chunk is a Dust primitive for controlling the flow of the template. Depending upon
         *                          the behaviors defined in the context, templates may output one or more chunks during
         *                          rendering. A handler that writes to a chunk directly must return the modified chunk.
         * @param  {Object} context the current context stack
         * @param  {Object} bodies  The bodies object provides access to any bodies defined within the calling block.
         *                          e.g. {:else} in {#guide}foo{:else}bar{/guide}
         * @param  {Object} params  The params object contains any inline parameters passed to a section tag
         * @return {Object}         the original chunk if not written to, or the chunk resulting from n write operations.
         */
        helpers.substr = function (chunk, context, bodies, params) {
            var str = dust.helpers.tap(params.str, chunk, context),
            begin = dust.helpers.tap(params.begin, chunk, context),
            end = dust.helpers.tap(params.end, chunk, context),
            len = dust.helpers.tap(params.len, chunk, context);
            begin = begin || 0;
            
            if (len) {
                return chunk.write(str.substr(begin,len));
            }
            if (end) {
                return chunk.write(str.slice(begin,end));
            }
            
            return chunk.write(str);
            
        };

         /**
         * Remove the h2 list divider in the activity rows, if it's not the first one of it's type
         *
         * @param  {Object} chunk   A Chunk is a Dust primitive for controlling the flow of the template. Depending upon
         *                          the behaviors defined in the context, templates may output one or more chunks during
         *                          rendering. A handler that writes to a chunk directly must return the modified chunk.
         * @param  {Object} context the current context stack
         * @param  {Object} bodies  The bodies object provides access to any bodies defined within the calling block.
         *                          e.g. {:else} in {#guide}foo{:else}bar{/guide}
         * @param  {Object} params  The params object contains any inline parameters passed to a section tag
         * @return {Object}         the original chunk if not written to, or the chunk resulting from n write operations.
         */
        helpers.displayFirstDivider = function(chunk, context, bodies, params) {
            
            if(bodies.block) {
                return chunk.capture(bodies.block, context, function(string, chunk) {
                    if(context.stack.index === 0) {
                        chunk.end(string);
                    }
                    else {
                        chunk.end("");
                    }
                });
            }
            return chunk;
        };
    }


    if (typeof module !== "undefined") {
        // Node
        /*global module:true*/
        module.exports = extend;
        /*global module:false*/
    } else if (typeof define !== "undefined") {
        // RequireJS
        define(function () {
            return extend;
        });
    } else if (window && window.dust) {
        // Vanilla
        extend(window.dust);
    }

}(typeof window !== 'undefined' ? window : undefined));