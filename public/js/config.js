'use strict';

requirejs.config({
	baseUrl: '',
    paths: {
        text: 'components/requirejs-text/text',
        angular: 'components/angular/angular.min',
        angularRoute: 'components/angular-route/angular-route.min',
        angularResource: 'components/angular-resource/angular-resource.min',
        angularExtendPromises: 'components/angular-extend-promises/angular-extend-promises.min',
        angularMocks: 'components/angular-mocks/angular-mocks',
        angularSanitize: 'components/angular-sanitize/angular-sanitize.min',
        angularUIUtils: 'components/angular-ui-utils/ui-utils.min',
        uiRouter: "components/angular-ui-router/release/angular-ui-router.min",
        requirejs: 'components/requirejs/require',
        squid: 'components/squid/dist',
        jquery: 'components/jquery/dist/jquery.min',
        angularPlaceHolderShim: 'components/angular-shims-placeholder/dist/angular-shims-placeholder.min'
    },
    shim: {
        'angular': {
            'exports': 'angular'
        },
        'angularRoute': {
            deps: ['angular']
        },
        'angularMocks': {
            deps: ['angular'],
            'exports': 'angular.mock'
        },
        'angularSanitize' : {
            deps : ['angular']
        },
        'uiRouter':{
            deps: ['angular']
        },
        'angularPlaceHolderShim': {
            deps: ['angular']
        }
    },
    priority: [
        'angular'
    ],
    useStrict: true
});
