'use strict';

define(['angular', 'uiRouter'], function (angular) {

    angular.module('squid.directive', ['ui.router'])
        .directive('trackSubmit', function ($state, $rootScope) {
            return {
                restrict: "AE",
                link: function ($scope, element, attr) {
                    element.on('mousedown', function (event) {
                        var trackSubmit = {
                            currentRoute: $state.current,
                            errors: []
                        };
                        angular.forEach($("input.ng-invalid, select.ng-invalid"),
                            function (el) {
                                var modelName = $(el).attr('ng-model'),
                                    errorText = $(el).attr('data-error-text');
                                trackSubmit.errors.push({
                                    fieldName: (modelName ? modelName : 'no-model'),
                                    errorMessage: (errorText ? errorText :
                                        ($(el).has('required') ? 'required' : 'no error text'))
                                });
                            });
                        $rootScope.$broadcast("trackSubmit", trackSubmit);
                    });
                }
            }
        });
});