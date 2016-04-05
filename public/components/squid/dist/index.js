define([
    'angular',
    'angularUIUtils',
    './module',
    './class',
    './api',
    './model',
    './route',
    './util',
    './locale',
    './config',
    './error',
    './directive',
    './events',
    './pxp'
], function (angular, angularUIUtils, module) {

    module('squid', [
        'squid.class',
        'squid.api',
        'squid.model',
        'squid.route',
        'squid.util',
        'squid.locale',
        'squid.config',
        'squid.error',
        'squid.directive',
        'squid.events',
        'squid.pxp',
        'ui.validate'
    ]);

    return {
        module: module
    };
});
