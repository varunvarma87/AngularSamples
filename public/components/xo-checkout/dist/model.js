'use strict';

define(['squid/index'], function (squid) {
    return squid.module('xocomponent', ['squid'])

        .factory('$CheckoutAppDataModel', function($Model, $Api, $config, $util) {

            return $Model.extend('CheckoutAppDataModel', {

                api: new $Api({
                    baseURI: $config.urls.baseUrl,
                    uri: '/api/checkout/:id/appData'
                }),

                // TODO : move useraction to CheckoutInputData
                useraction: function() {
                    return $util.param('useraction');
                }
            });
        })

        .factory('$CheckoutClientDataModel', function($Model, $Api, $config) {

            return $Model.extend('CheckoutClientDataModel', {

                api: new $Api({
                    baseURI: $config.urls.baseUrl,
                    uri: '/api/user/:id/clientData'
                }),

                merchantIdentityData: function() {
                    return {
                        email: this.email,
                        brand_name: this.display_name,
                        logo_uri: this.logo_uri,
                        identity_uri: this.identity_uri
                    }
                },

                validate: function () {
                    if (this.partner_id && this.identity_uri) {
                        return {
                            success: true
                        };
                    }
                    else {
                        return {
                            success: false,
                            error: 'invalid_client'
                        }
                    }
                }
            });
        })
        .factory('$CheckoutInputDataModel', function($Model, $Api, $config, $util) {

            var ACTION = {
                login: 'login',
                resolve: 'resolve',
                addCard: 'addCard',
                addBank: 'addBank',
                changeCurrencyConv: 'changeCurrencyConv',
                signup: 'signup',
                mandate: 'mandate'
            };

            return $Model.extend('CheckoutInputDataModel', {

                init: function() {
                    this._super.init.apply(this);
                    this.setProperties({
                        client_id: $util.param('client_id'),
                        action: $util.param('action'),
                        redirect_uri: $util.param('redirect_uri'),
                        scope: $util.param('scope'),
                        state: $util.param('state'),
                        payer_id: $util.param('payer_id'),
                        mandate_reference_number: $util.param('mandate_reference_number'),
                        funding_option_id: $util.param('funding_option_id'),
                        locale: $util.param('locale'),
                        logout: $util.param('logout'),
                        refresh_parent: $util.param('refresh_parent')
                    });
                },

                api: new $Api({
                    baseURI: $config.urls.baseUrl,
                    uri: '/api/user/:id/payerId'
                }),

                isEbayTxn: function () {
                    return Boolean(this.client_id);
                },

                validAction: function () {
                    var actions = {
                        login: 'login',
                        resolve: 'resolve',
                        addCard: 'addCard',
                        addBank: 'addBank',
                        changeCurrencyConv: 'changeCurrencyConv',
                        signup: 'signup',
                        mandate: 'mandate'
                    };
                    return actions.hasOwnProperty(this.action);
                },

                showRYP: function() {
                    return !this.isEbayTxn();
                },

                requiresOAuth: function () {
                    return (this.action === ACTION.login) || (this.action === ACTION.signup)
                },

                requiresRedirectUri: function () {
                    return (this.action === ACTION.mandate) || !this.requiresOAuth();
                },

                validRedirectUri: function () {
                    if (this.requiresRedirectUri()) {
                        return Boolean(this.redirect_uri)
                    }
                    return true;
                },

                validate: function () {
                    var error;
                    var success = true;
                    if (this.isEbayTxn()) {
                        if (!this.validAction()) {
                            success = false;
                            error = 'invalid_action';
                        }
                        else if (!this.validRedirectUri()) {
                            success = false;
                            error = 'invalid_redirect_uri';
                        }
                    }

                    return {
                        success: success,
                        error: error
                    }
                }
            });
        })
        .factory('$CheckoutSessionModel', function($Model, $Api, $config, $CheckoutPlanModel) {

            return $Model.extend('CheckoutSessionModel', {

                api: new $Api({
                    baseURI: $config.urls.baseUrl,
                    uri: '/api/checkout/:id/session',
                    postAttempts: 2
                }),

                onPopulate: function() {
                    this.plan = new $CheckoutPlanModel(this.plan);
                }
            });
        })

        .factory('$CheckoutPlanModel', function($Model, $FundingSourceModel, $util) {

            return $Model.extend('CheckoutPlanModel', {

                onPopulate: function() {
                    this.sources = this.children($FundingSourceModel, this.sources);
                },

                eachSource: function(method, context) {
                    angular.forEach(this.sources, method, this);
                },

                hasFundingMethodType: function(name) {
                    var found = false;

                    this.eachSource(function(source) {
                        if (source.type === name) {
                            found = true;
                        }
                    }, this);

                    return found;
                },

                hasFundingMethodSubType: function(name) {
                    var found = false;

                    this.eachSource(function(source) {
                        if (source.sub_type === name) {
                            found = true;
                        }
                    }, this);

                    return found;
                },

                isPAD: function() {
                    return this.hasFundingMethodSubType('DELAYED_TRANSFER');
                },

                isMSB: function() {
                    return this.sources && this.sources.length === 1 && this.sources[0].type === 'INCENTIVE';
                },

                isBalance: function() {
                    return this.sources && this.sources.length === 1 && this.sources[0].type === 'BALANCE';
                }
            });
        })

        .factory('$FundingSourceModel', function($Model) {

            return $Model.extend('FundingSourceModel', {

                formatLast4: function() {
                    var last4;

                    if (this.last4) {
                        last4 = this.last4

                        if (!this.parent.isAuthRequired) {
                            last4 = 'x-' + last4;
                        }
                    }

                    return last4;
                }
            });
        })

        .factory('$FundingOptionsModel', function($Model, $Api, $config, $util) {
            return $Model.extend('FundingOptionsModel', {
                api: new $Api({
                    baseURI: $config.urls.baseUrl,
                    uri: '/api/checkout/:id/fundingOptions',
                    postAttempts: 2
                }),

                hasECheck: function() {
                    return $util.some(this.instruments, function(instrument) {
                        return instrument.type === 'ECHECK';
                    })
                },

                hasCredit: function() {
                    return $util.some(this.instruments, function(instrument) {
                        return instrument.type === 'CREDIT';
                    })
                }
            });
        })

        .factory('$InstallmentOptionsModel', function ($Model, $Api, $config) {
            return $Model.extend('InstallmentOptionsModel', {
                api: new $Api({
                    baseURI: $config.urls.baseUrl,
                    uri: '/api/checkout/:id/installmentOptions/',
                    postAttempts: 2
                })
            });
        })

        .factory('$FlowEligibilityModel', function($Model, $Api, $config) {
            return $Model.extend('FlowEligibilityModel', {
                api: new $Api({
                    baseURI: $config.urls.baseUrl,
                    uri: '/api/checkout/:id/flowEligibility'
                })
            });
        })


        .factory('$UserInfoModel', function($Model, $Api, $config) {
            return $Model.extend('UserInfoModel', {
                api: new $Api({
                    baseURI: $config.urls.baseUrl,
                    uri: '/api/user/:id/session'
                })
            });
        })

        .factory('$TransactionEligibilityModel', function($Model, $Api, $config) {
            return $Model.extend('TransactionEligibilityModel', {
                api: new $Api({
                    baseURI: $config.urls.baseUrl,
                    uri: '/api/eligibility/transaction/:id'
                })
            });
        })

        .factory('$BuyerEligibilityModel', function($Model, $Api, $config) {
            return $Model.extend('BuyerEligibilityModel', {
                api: new $Api({
                    baseURI: $config.urls.baseUrl,
                    uri: '/api/eligibility/buyer/:id'
                })
            });
        })

        .factory('$PrefillAddressModel', function ($Model, $config) {
            return $Model.extend('PrefillAddressModel', {
                api: new $Api({
                    baseURI: $config.urls.baseUrl,
                    uri: '/api/address/prefill'
                })
            });
        })

        .factory('$BillingAddressesModel', function($Model, $BillingAddressModel, $Api, $config, $util) {
            return $Model.extend('BillingAddressesModel', {
                api: new $Api({
                    baseURI: $config.urls.baseUrl,
                    uri: '/api/fi/billingaddress'
                }),

                onPopulate: function() {
                    this.addresses = this.children($BillingAddressModel, this.addresses);
                }
            });
        })

        .factory('$BillingAddressModel', function($Model, $Api, $config, $util) {
            return $Model.extend('BillingAddressModel', {
                api: new $Api({
                    baseURI: $config.urls.baseUrl,
                    uri: '/api/fi/billingaddress/validate'
                }),

                format: function() {
                    return $util.filter([
                            this.line1,
                            this.line2,
                            this.city,
                            this.state,
                            this.country
                        ]).join(', ') + ' ' + this.postal_code;
                },

                serialize: function() {
                    return {
                        line1:       this.line1,
                        line2:       this.line2,
                        city:        this.city,
                        state:       this.state,
                        postal_code: this.postal_code,
                        country: this.country
                    }
                }
            });
        })

        .service('$CreditOptionsModel', function(){
            return {
                sacEligibleAmount : {
                    'US' : 99,
                    'GB' : 150
                }
            }
        });
});
