define([
    'angular',
    'squid/index',
    'components/xo-beaver/dist/logger',
    './resolvers',
    './language'
], function (angular, squid) {

    return squid.module('xolocale', [
        'squid',
        'beaver',
        'locale.resolvers'
    ]);


});