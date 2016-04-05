'use strict';

define(['squid/index'], function(squid) {
    return squid.module('xocomponent', ['squid'])
        .factory('$CheckoutCartApi', function($Api, $config) {

            return $Api.extend('CheckoutCartApi', {
                baseURI: $config.urls.baseUrl,
                uri: '/api/checkout/:id/cart',
                cache: true
            });
        });
});
