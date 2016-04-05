'use strict';

define(['squid/index', './api'], function (squid) {
    return squid.module('xocomponent', ['squid'])
        .factory('$AuthModel', function($Model, $AuthApi) {

            return $Model.extend('AuthModel', {
                api: new $AuthApi,
                
                loggedIn: function() {
                    return this.logged_in;
                },

                visitorId: function() {
                	return this.visitor_id;
                }
            });
        });
});
