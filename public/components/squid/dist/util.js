'use strict';

define(['angular', 'components/xo-beaver/dist/logger'], function (angular) {
    return angular.module('squid.util', ['beaver'])
        .factory('$util', function($window, $logger, $rootScope, $timeout, $q) {

            return {

                ready: $q(function(resolve) {

                    angular.element(document).ready(function() {
                        resolve();
                    });

                    var prevOnLoad = window.onload;

                    window.onload = function() {
                        resolve();
                        if (prevOnLoad) {
                            prevOnLoad.apply(this, arguments);
                        }
                    };

                    var interval = setInterval(function () {
                        if (document.readyState === 'complete') {
                            clearInterval(interval);
                            resolve();
                        }
                    }, 100);
                }),

                redirect: function(url) {

                    $rootScope.$emit('loading');

                    $logger.info('redirect', {
                        url: url
                    });

                    $logger.flush().then(function() {
                        $window.onunload = $window.onbeforeunload = function() {};
                        $window.location = url;
                    });

                    $logger.done();
                },

                cookiesEnabled: function() {
                    var cookiesEnabled = navigator.cookieEnabled;
                    if (typeof cookiesEnabled === 'undefined') {
                        document.cookie = '_cookiecheck';
                        cookiesEnabled = Boolean(~document.cookie.indexOf('_cookiecheck'));
                        document.cookie = '_cookiecheck=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                    }
                    return cookiesEnabled;
                },

                elementJSON: function(id) {
                    var element = document.getElementById(id);
                    var text    = angular.element(element).text();

                    return text ? JSON.parse(text) : {};
                },

                param: function $param(name) {
                    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                        results = regex.exec(location.search);
                    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
                },

                assert: function $assert(value, message) {
                    if (!value) {
                        throw new Error(message);
                    }
                },

                map: function $map(array, method) {
                    var results = [];

                    angular.forEach(array, function() {
                        results.push(method.apply(this, arguments));
                    });

                    return results;
                },

                filter: function $filter(array, method) {
                    method = method || Boolean;
                    var results = [];

                    angular.forEach(array, function(item) {
                        if (method.apply(this, arguments)) {
                            results.push(item);
                        }
                    });

                    return results;
                },

                range: function(start, end) {
                    if (!end) {
                        end = start;
                        start = 0;
                    }

                    var result = [];

                    for (var i=start; i<end; i++) {
                        result.push(i);
                    }

                    return result;
                },

                pad: function $pad(string, n, char) {

                    n = n || 0;
                    char = char || '0';

                    var padding = Array(n+1).join(char.toString());

                    return (padding + string).slice(-n);
                },

                some: function $some(array, method){
                    var result;

                    angular.forEach(array, function(item){
                        if(!result){
                            result = method(item);
                        }
                    });

                    return result;
                },

                reduce: function $reduce(array, method, intial){
                    angular.forEach(array, function(item){
                        intial = method(intial, item);
                    });
                    return intial;
                },

                isIFrame: function() {
                    return $window.top !== $window.self;
                },

                buildURL: function(url, params) {
                    this.assert(url, 'buildURL :: expected url');

                    if (!params) {
                        return url;
                    }

                    if (!~url.indexOf('?')) {
                        url += '?';
                    }
                    else {
                        url += '&';
                    }

                    url += this.filter(this.map(params, function(val, key) {

                        if (!val) {
                            return;
                        }

                        return key + '=' + encodeURIComponent(val);
                    })).join('&');

                    return url;
                },

                override: function(obj, methodName, handler) {
                    var methodNames = Array.prototype.slice.call(arguments, 1);

                    var existing = obj[methodName];

                    obj[methodName] = function() {
                        if (existing) {
                            try {
                                existing.apply(obj, arguments);
                            }
                            catch(err) {
                                $logger.error(methodName + 'event_error', {
                                    error: err.toString
                                });
                            }
                        }

                        return handler.apply(obj, arguments);
                    }
                }
            }
        });
});
