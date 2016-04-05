'use strict';

define(['angular', './class'], function (angular) {
    return angular.module('squid.config', ['squid.class'])

        .factory('$Config', function($Class, $window) {
            var hostname = $window.location && $window.location.hostname || '';

            return $Class.extend('Config', {

                init: function() {
                    this.setProperties($window.config);
                },

                urls: {

                },

                deploy: {
                    isLocal: function() {
                        return $window.location.hostname === 'localhost' ||
                            hostname === 'localhost.paypal.com';
                    },

                    isStage: function() {
                        return Boolean(hostname.match(/^.*\.qa\.paypal\.com$/));
                    },

                    isLive: function() {
                        return hostname === 'www.paypal.com';
                    }
                }
            })
        })

        .service('$config', function($Config) {
            return new $Config;
        })
});
