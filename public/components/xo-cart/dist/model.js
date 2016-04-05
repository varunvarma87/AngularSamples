'use strict';

define(['squid/index', './api'], function (squid) {
    return squid.module('xocomponent', ['squid'])
        .factory('$CheckoutCartModel', function($Model, $CheckoutCartApi) {
            return $Model.extend('CheckoutCartModel', {
                api: new $CheckoutCartApi,

                isPurchase: function() {
                    return Boolean(this.purchase);
                },

                isBilling: function() {
                    return Boolean(this.billing);
                },

                isBillingPurchase: function() {
                    return this.isPurchase() && this.isBilling();
                },

                isBillingNoPurchase: function() {
                    return this.isBilling() && !this.isPurchase();
                }
            });
        });

});
