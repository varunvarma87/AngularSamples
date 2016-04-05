define([
    'angular',
    'squid/index',
    './helper',
    'components/xo-beaver/dist/logger',
    'components/xo-login/dist/model',
    'components/xo-checkout/dist/model',
    'components/xo-cart/dist/model'

], function (angular, squid, helper) {

    return squid.module('locale.resolvers.country', [
        'squid',
        'xocomponent'
    ])
    .factory('$CountryResolvers', function($q,
                                       $rootScope,
                                       $populate,
                                       $util,
                                       $AuthModel,
                                       $CheckoutCartModel,
                                       $CheckoutAppDataModel){
         return {

            viaLocaleTestUrlParam: {
                name: "viaLocaleTestUrlParam",
                desc: 'For non-LIVE test, read from locale.test url param, e.g. http://localhost.com:3000/?locale.test=fr_FR',
                method: function(){
                    var LOCAL_PARAM = "locale.test";
                    var locale = $util.param(LOCAL_PARAM);
                    var country;
                    if(locale){
                        country = helper.normalizeLocale(locale).country;
                    }
                    return $q.when(country);
                }
            },

            viaUserProfile:{
                name: "viaUserProfile",
                desc: 'From AuthModel. Country comes as "US", "FR" etc. ',
                method: function(){
                    var data = {};
                    return $populate(data, {
                        auth: $AuthModel.instance()
                    }).then(function(){
                        return data.auth.country;
                    });
                }
            },

            viaCheckoutSession: {
                name: "viaCheckoutSession",
                desc: 'From Merchant locale in CheckoutAppDataModel. merchant_locale comes as en_US etc.',
                method: function(){
                    var data = {};
                    return $populate(data, {
                        checkoutAppData: $CheckoutAppDataModel.instance($rootScope.token)
                    }).then(function(){
                        var merchant_locale = data.checkoutAppData.get('merchant.merchant_locale');
                        return helper.normalizeLocale(merchant_locale && merchant_locale).country;
                    });
                }
            },

            viaCheckoutShipping: {
                name: "viaCheckoutShipping",
                method: function(){
                    var data = {};
                    return $populate(data, {
                        checkoutCart: $CheckoutCartModel.instance($rootScope.token)
                    }).then(function(){
                        return data.checkoutCart.get('purchase.shipping_address.country_code');
                    });

                }
            },

            viaMerchantCountry: {
                name: "viaMerchantCountry",
                method: function(){
                    var data = {};
                    return $populate(data, {
                        checkoutAppData: $CheckoutAppDataModel.instance($rootScope.token)
                    }).then(function(){
                        return data.checkoutAppData.get('merchant.merchant_country');
                    });
                }
            }

         }
    });

});
