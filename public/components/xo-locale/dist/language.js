define([
    'angular',
    'squid/index',
    './helper',
    'components/xo-beaver/dist/logger',
    'components/xo-login/dist/model',
    'components/xo-checkout/dist/model',
    'components/xo-cart/dist/model'

], function (angular, squid, helper) {

    return squid.module('locale.resolvers.language', [
        'squid',
        'xocomponent'
    ])
        .factory('$LanguageResolvers', function($q,
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
                        var language;
                        if(locale){
                            language = helper.normalizeLocale(locale).language;
                        }

                        return $q.when(language);
                    }
                },

                viaUserProfile: {
                    name: "viaUserProfile",
                    method: function(country){
                        var data = {};
                        return $populate(data, {
                            auth: $AuthModel.instance()
                        }).then(function(){
                            return data.auth.language;
                        });
                    }
                },


                viaMerchantLocale: {
                    name: "viaMerchantLocale",
                    method: function(){
                        var data = {};
                        return $populate(data, {
                            checkoutAppData: $CheckoutAppDataModel.instance($rootScope.token)
                        }).then(function(){
                            return helper.normalizeLocale(data.checkoutAppData.get('merchant.merchant_locale')).language;
                        });
                    }
                }

            }
        });

});