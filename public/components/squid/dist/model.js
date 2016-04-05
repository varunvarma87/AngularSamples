'use strict';

define(['angular', './class', './util'], function (angular) {
    angular.module('squid.model', ['squid.class', 'squid.util'])

        .factory('$Model', function($Class, $q, $log, $util) {

            var Model = $Class.extend('Model', {

                init: function() {

                    if (this.keys().length) {
                        this.onPopulate();
                    }

                    if (this.id) {
                        var cache = this.constructor._modelCache = this.constructor._modelCache || {};
                        cache[this.id] = this;
                    }

                    this.meta = {
                        populated: false
                    };
                },

                populate: function() {
                    this.meta.populated = true;
                    this.setProperties.apply(this, arguments);
                    delete this.meta.invalidated;
                    this.onPopulate();
                },

                onPopulate: function() {

                },

                retrieve: function(options) {
                    var instance = this;
                    options = options || {};

                    if (instance.meta.populated) {
                        return $q.when(this);
                    }

                    if (this.retriever) {
                        return this.retriever;
                    }

                    if (!this.api) {
                        throw new Error('Tried to populate a model with no api');
                    }

                    options.model = this;

                    return this.retriever = this.api.retrieve(options).then(function(res) {
                        return instance;
                    })['finally'](function() {
                        delete instance.retriever;
                    });
                },

                save: function(options) {
                    options = options || {};
                    options.model = this;

                    options.data = options.data || this.serialize();

                    return this.api.post(options);
                },

                action: function(action, options) {
                    var instance = this;

                    options = options || {};
                    options.model = this;

                    return this.api.action(action, options);
                },

                reload: function(options) {
                    this.meta.populated = false;
                    return this.retrieve(options);
                },

                stringify: function() {
                    return JSON.stringify(this, null, 2);
                },

                log: function() {
                    console.log(this.stringify());
                },

                serialize: function() {

                },

                invalidate: function() {
                    this.meta.populated = false;
                    this.meta.invalidated = true;
                },

                child: function(Cls, child) {
                    if (!child) {
                        return child;
                    }

                    return new Cls(child, {
                        parent: this
                    });
                },

                children: function(Cls, children) {
                    var instance = this;

                    if (!children) {
                        return children;
                    }

                    return $util.map(children, function(child) {
                        return instance.child(Cls, child);
                    });
                }
            });

            Model.reopenClass({

                instance: function(id) {
                    var model = this;

                    id = id || 0;

                    var cache    = model._modelCache = model._modelCache || {};
                    var instance = cache[id] || model.create.apply(this, arguments);

                    return instance;
                },

                create: function(id) {
                    var model = this;

                    id = id || 0;

                    var instance = new model({
                        id: id
                    });

                    var cache    = model._modelCache = model._modelCache || {};
                    var instance = cache[id] = new model({id: id});

                    instance.setProperties.apply(instance, Array.prototype.slice.call(arguments, 1));

                    return instance;
                },

                fetch: function() {
                    $log.warn('Model.fetch is deprecated, please use Model.instance');
                    return this.instance.apply(this, arguments);
                }
            });

            return Model;
        })

        .factory('$populate', function($q, $util, $timeout) {

            return function $scopeData($scope, instances) {

                var activePopulate = 0;

                $scope.$on = $scope.$on || angular.noop;
                $scope.$emit = $scope.$emit || angular.noop;

                var events = [

                    $scope.$on('_populating', function(event) {
                        activePopulate += 1;
                    }),

                    $scope.$on('_populated', function(event) {
                        activePopulate -= 1;

                        if (!activePopulate) {

                            angular.forEach(events, function(event) {
                                event();
                            });

                            $scope.$emit('populated');
                        }
                    })
                ];

                $scope.$on('populated', function(event) {
                    event.stopPropagation();
                });

                $scope.$emit('_populating');

                return $q.all($util.map(instances, function(instance, name) {

                    var promise;

                    if (instance.then) {
                        promise = instance;
                    }
                    else {
                        promise = instance.retrieve();
                        $scope[name] = instance;
                    }

                    return promise.then(function(result) {
                        $scope[name] = result;
                        return result;
                    });

                })).then(function(result) {
                    $scope.$emit('_populated');
                    return result;
                });
            }
        })
});
