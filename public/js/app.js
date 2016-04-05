'use strict';

require(['config'], function() {
    require(['angular', 'angularRoute'], function(a, r) {
        var angApp = angular.module('app', ['ngRoute'], function($interpolateProvider) {
            $interpolateProvider.startSymbol('[[');
            $interpolateProvider.endSymbol(']]');
        }).factory('TaxIds', function ($http) {
            return {
                getTaxIds: function() {
                    return $http({
                        url: 'listTaxID',
                        method: 'GET'
                    });
                }
            };
        }).factory('TaxIdStore', function ($http) {
            return {
                taxidlist: [],
                setTaxIdList: function(list) {
                    for(var i in list) {
                        list[i].actualValue = "";
                    }
                    this.taxidlist = list;
                },
                getTaxIdList: function() {
                    return this.taxidlist;
                },
                getTaxIdDetail: function(type) {
                    for(var i in this.taxidlist) {
                        if(this.taxidlist[i].type === type) {
                            return this.taxidlist[i];
                        }
                    }
                    return false;
                },
                isTaxIdListPresent: function() {
                    if (typeof this.taxidlist !== 'undefined' && this.taxidlist.length > 0) {
                        return true;
                    }
                    return false;
                }
            };
        }).controller('TaxIdsController', [
            '$scope',
            '$http',
            'TaxIds',
            'TaxIdStore',
            function ($scope, $http, TaxIds, TaxIdStore) {
                if(!TaxIdStore.isTaxIdListPresent()) {
                    TaxIds.getTaxIds().success(function (data, status, headers, config) {
                        TaxIdStore.setTaxIdList(data);
                        $scope.taxids = TaxIdStore.getTaxIdList();
                    });
                } else {
                    $scope.taxids = TaxIdStore.getTaxIdList();
                }
                $scope.dummyvalue = 'asasa';
            }
        ]).controller('TaxIdAddController', [
            '$scope',
            '$http',
            '$location',
            '$routeParams',
            '$timeout',
            'TaxIds',
            'TaxIdStore', 
        function ($scope, $http, $location, $routeParams, $timeout, TaxIds, TaxIdStore) { 
            if(!TaxIdStore.isTaxIdListPresent()) { 
                TaxIds.getTaxIds().success(function (data, status, headers, config) { 
                    TaxIdStore.setTaxIdList(data); 
                    $scope.taxids = TaxIdStore.getTaxIdList(); 
                    $scope.taxid = TaxIdStore.getTaxIdDetail($routeParams.type);
                }); 
            } else { 
                $scope.taxids = TaxIdStore.getTaxIdList(); 
                $scope.taxid = TaxIdStore.getTaxIdDetail($routeParams.type);
            }
            $scope.taxidtype = $routeParams.type;
            $scope.submit = function() {
                //validation?
                var spinny = function(show, msg) {
                    var wrapperdiv = document.getElementsByClassName('tax-main-view')[0],
                        statusdiv = document.getElementById('statusLine');
                    if(show) {
                        wrapperdiv.className = 'tax-main-view loading';
                    } else {
                        wrapperdiv.className = 'tax-main-view';
                    }
                    if(msg !== "") {
                        statusLine.className = msg.class;
                        statusLine.innerHTML = msg.message;
                    } else {
                        statusLine.className = '';
                        statusLine.innerHTML = ''
                    }
                };
                //show spinner
                spinny(true, "");
                $http({
                    url: 'putTaxID',
                    method: 'POST',
                    data: $scope.taxid
                }).success(function (data, status, headers, config) { 
                    //hide spinner
                    //show success msg
                    spinny(false, {'class': 'success', 'message': data.success});
                    //redirect to main page after a sec
                    $timeout(
                        function() {
                            $location.path('TaxIdNg');
                        },
                        1000
                    );
                }).error(function(data, status, headers, config) {
                    //hide spinner
                    //show error msg
                    spinny(false, {'class': 'error', 'message': data.error});
                });
            }
        }

        ]).config([
            '$routeProvider',
            '$locationProvider',
            function ($routeProvider, $locationProvider) {
                $locationProvider.html5Mode(true);
                $routeProvider.when('/TaxIdNg', {
                    templateUrl: '/taxids.html',
                    controller: 'TaxIdsController'
                }).when('/TaxIdNg/add/:type', {
                    templateUrl: '/taxidAdd.html',
                    controller: 'TaxIdAddController'
                }).when('/TaxIdNg/update/:type', {
                    templateUrl: '/taxidAdd.html',
                    controller: 'TaxIdAddController'
                });
            }
        ]);

        //app init
        angApp.run(function($rootScope) {
            $rootScope.getContent = function(key) {
                var sp = key.split('.');
                if(sp.length == 1) {
                    return loccontent[key];
                }
                var ans = loccontent;
                for(var i in sp) {
                    ans = ans[sp[i]];
                }
                return ans;
            };
        });

        angular.element().ready(function() {
            angular.bootstrap(document, ['app']); //manually bootstrap angular, since we are using require
        });

    });
});
