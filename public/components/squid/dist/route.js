'use strict';

define([
    'angular',
    'uiRouter',
    './class',
    'components/xo-beaver/dist/logger'

], function (angular) {

    var $stateProvider, $urlRouterProvider;

    return angular.module('squid.route', ['squid.class', 'ui.router', 'beaver'])

        .config(function($injector) {
            $stateProvider = $injector.get('$stateProvider');
            $urlRouterProvider = $injector.get('$urlRouterProvider');
        })

        .factory('$ComponentRoute', function($q, $Class, $injector, $state, $window, $rootScope, $logger, $util) {

            return $Class.extend('ComponentRoute', {

                init: function() {
                    var route = this;

                    if(!route.url){
                        route.url = '/' + route.name;
                    }

                    route.hasResolver = Boolean(route.resolve);

                    if (route.get('resolve.action') && !route.controller) {
                        route.controller = function(action) {
                            if (action) {
                                $state.go(action);
                            }
                        }
                    }
                },

                bootstrap: function(defaultState, middleware) {
                    var route = this;

                    $logger.info('bootstrap_route', {
                        route: route.name
                    });

                    //In case someone hits a route which is not present, it could be possible that registration is not yet complete.
                    //Try registering the routes to resolve this race condition.
                    $rootScope.$on('$stateNotFound', function(event, unfoundState, fromState, fromParams) {
                        event.preventDefault();

                        $logger.error('state_not_found', {
                            name: unfoundState.to,
                            from: fromState.name,
                            fromParams: fromParams,
                            hash: $window.location.hash
                        });

                        throw new Error('state_not_found: ' + unfoundState.to);
                    });

                    //This is for the first time load. If there is a hash url that user is hitting directly, then try reg
                    $urlRouterProvider.otherwise(function() {

                        var targetState = $window.location.hash && $window.location.hash.slice(2).replace(/\//g, '.');

                        $logger.info('initializing_route', {
                            target: targetState,
                            defaultState: defaultState,
                            hash: $window.location.hash
                        });

                        route.load(targetState, defaultState, middleware);
                    });
                },

                middleware: function(middleware) {

                    $logger.info('middleware', {
                        priority: $util.map(middleware, function(method) {
                            return method.name;
                        }).join('|')
                    });

                    var promise = $q.when();

                    angular.forEach(middleware, function(method) {
                        promise = promise.then(method);
                    });

                    return promise;
                },

                /**
                 *
                 * @param targetState - This is the state to which app will be routed after registering is done
                 * @param await - If true, will wait for all routes to be registered before routing to target route.
                 *
                 * @returns {*}
                 */
                load: function(targetState, defaultState, middleware) {
                    var route = this;

                    var parentName;
                    var attributes = [];

                    route.register(parentName, attributes);

                    route.middleware(middleware).then(function() {

                        if (targetState && $state.get(targetState)) {
                            $state.go(targetState);
                        }
                        else if (!$state.current.name) {
                            if ($state.get(defaultState)) {
                                $state.go(defaultState);
                            }
                            else {
                                throw new Error('Default state not found: ' + defaultState);
                            }
                        }
                    });
                },

                register: function(parentName, attributes) {
                    var route = this;

                    route.template = route.constructTemplate(attributes);

                    var name = route.name;

                    if (parentName) {
                        name = parentName + '.' + route.name;
                    }

                    if (!$state.get(name)) {
                        $stateProvider.state(name, route);
                    }

                    angular.forEach(route.children, function (child) {

                        var ChildRoute = $injector.get(child.name);
                        var childRoute = new ChildRoute;

                        //Register the child route recursively.
                        childRoute.register(route.name, child.attributes);
                    });
                },

                /**
                 * Constructs the template string for this route. If route.directive = 'xo-add-bank', then the template will be
                 * '<xo-add-bank/>'.
                 * If attributes are specified, they will be passed to directive. Ex: <xo-add-bank attrname = "attrvalue"/>
                 *
                 * @param attributes - A map of name value pairs - {name: value}.
                 * @returns {string}
                 */
                constructTemplate: function(attributes){
                    var route  = this;

                    if(!route.directive) return;

                    var paramString = '';

                    angular.forEach(attributes, function(value, key){
                        paramString += ' '+ key + '="'+value+'"';
                    });

                    return '<' + route.directive + paramString + '></' + route.directive +'>'

                }
            });
        });
});
