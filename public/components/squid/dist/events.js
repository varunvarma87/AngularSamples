'use strict';

define(['angular'], function (angular) {

    var loadingCounter = 0;

    return angular.module('squid.events', [])

        .factory('$loader', function() {
            return {
                isLoading: function() {
                    return Boolean(loadingCounter);
                }
            }
        })

        .run(function($rootScope, $timeout) {

            $rootScope.$on('loading', function() {
                loadingCounter += 1;
            });

            $rootScope.$on('loaded', function() {
                loadingCounter -= 1;

                $timeout(function() {
                    if (!loadingCounter) {
                        $rootScope.$emit('allLoaded');
                    }
                }, 50);
            });
        });
});
