define([
    'squid/index',
    './model',
    'text!./template.html',
    'components/xo-checkout/dist/model'
], function(squid, model, template) {
    squid.module('xocomponent', ['squid'])
        .directive('xoCart', function() {
            return {
                template: template,
                restrict: 'E',
                scope: {
                    token: '='
                },
                controller: function($scope, $populate, $rootScope, $util, $CheckoutCartModel, $CheckoutAppDataModel) {
                    $util.assert($scope.token, 'Expected token');

                    $populate($scope, {
                        checkoutAppData: $CheckoutAppDataModel.instance($scope.token),
                        checkoutCart:    $CheckoutCartModel.instance($scope.token)

                    }).then(function() {

                        $scope.hasItems = ($scope.checkoutCart.get('purchase.items.length', 0) > 0);

                        $scope.showAmt = function() {
                            return ($util.param('useraction') === 'commit' ||
                                        $scope.checkoutAppData.get('merchant.merchant_country') !== 'AU' ||
                                        $scope.hasItems) &&
                                    $scope.checkoutCart.isPurchase();
                        }



                        $scope.showCart = false;

                        $scope.toggleCart = function ($event) {
                            $scope.showCart = !$scope.showCart;
                            $event.preventDefault();
                        }

                        $scope.closeCart = function ($event) {
                            $scope.showCart = false;
                            $event.preventDefault();
                        }

                        $scope.$on('clickBody', function ($event, target) {
                            if (($(target).parents(".cartContainer")).length === 0) {
                                $scope.closeCart($event);
                                $scope.$apply();
                            }
                        });

                        $scope.$emit('dataLoaded');
                    });
                }
            }

        });
});
