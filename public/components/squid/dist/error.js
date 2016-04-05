'use strict';

define(['angular', './class'], function (angular) {
    return angular.module('squid.error', ['squid.class'])

        .run(function($rootScope) {

            var existingErrorHandler;

            if (window.onerror && !window.onerror.replace) {
                existingErrorHandler = window.onerror;
            }

            window.onerror = function(message, file, line, col, err) {

                $rootScope.$emit('$windowError', {
                    message: message && (message.stack || message).toString(),
                    file: file && file.toString(),
                    line: line && line.toString(),
                    col: col && col.toString(),
                    stack: err && (err.stack || err).toString()
                });

                if (existingErrorHandler) {
                    existingErrorHandler.apply(null, arguments);
                }
            }
        })

        .factory('$Error', function($Class) {

            return $Class.extend.call(Error, 'Error', {

                construct: function(error) {

                    if (error instanceof Error) {
                        error = error.message;
                    }

                    this.message = error;
                }
            });
        })

        .factory('$Contingency', function($Error) {
            return $Error.extend('Contingency', {
                handle: function(handlers) {
                    var handler = handlers[this.message] || handlers['DEFAULT'];
                    if (handler) {
                        var result = handler.call(this);
                        if (typeof result !== 'undefined') {
                            return result;
                        }
                        return true;
                    }
                }
            });
        })

        .factory('$Forbidden', function($Error) {
            return $Error.extend('Forbidden');
        })

        .factory('$ApiError', function($Error) {
            return $Error.extend('ApiError');
        })
});
