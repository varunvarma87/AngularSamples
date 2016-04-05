'use strict';

define(['squid/index'], function(squid) {
    return squid.module('xocomponent', ['squid'])

        .factory('$AuthApi', function($Api, $config) {
            return $Api.extend('AuthApi', {
                baseURI: $config.urls.baseUrl,
                uri: '/api/auth',
                postAttempts: 3
            });
        });
});
