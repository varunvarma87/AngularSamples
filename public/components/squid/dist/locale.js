'use strict';

var CURRENCY_SYMBOLS = {
    'USD': '$', // US Dollar
    'AUD': '$', // AU Dollar
    'CAD': '$', // CA Dollar
    'EUR': '€', // Euro
    'CRC': '₡', // Costa Rican Colón
    'GBP': '£', // British Pound Sterling
    'ILS': '₪', // Israeli New Sheqel
    'INR': '₹', // Indian Rupee
    'JPY': '¥', // Japanese Yen
    'KRW': '₩', // South Korean Won
    'NGN': '₦', // Nigerian Naira
    'PHP': '₱', // Philippine Peso
    'PLN': 'zł', // Polish Zloty
    'PYG': '₲', // Paraguayan Guarani
    'THB': '฿', // Thai Baht
    'UAH': '₴', // Ukrainian Hryvnia
    'VND': '₫',  // Vietnamese Dong
    'BRL': 'R$' // Brazilian Real
};

var COUNTRY_FORMAT = {
    DEFAULT: {
        ",": ".",
        ".": ","
    },
    "AU": {

    },
    "GB": {

    },
    "US": {

    },
    "BR": {
        "pt": {
            ",": ".",
            ".": ","
        }
    },
    "CA": {
        "fr": {
            ",": " ",
            ".": ","
        }
    },
    "DE": {
        "de": {
            ",": ".",
            ".": ","
        }
    },
    "ES": {
        "es": {
            ",": ".",
            ".": ","
        }
    },
    "FR": {
        "fr": {
            ",": " ",
            ".": ","
        }
    },
    "IT": {
        "it": {
            ",": ".",
            ".": ","
        }
    }
}


define([
    'angular',
    'angularSanitize',
    './api',
    './model',
    './util',
    './config',
    'components/xo-beaver/dist/logger'
], function (angular) {
    return angular.module('squid.locale', ['squid.api', 'squid.model', 'squid.util', 'squid.config', 'ngSanitize', 'beaver'])

        .factory('$ContentModel', function($Model, $Api, $q, $config, $window, $rootScope, $logger, $timeout) {

            var contentCache = {};

            $window.addContent = function(country, lang, content) {
                var countryCache = contentCache[country] = contentCache[country] || {};
                countryCache[lang] = content;
            }

            return $Model.extend('ContentModel', {

                api: new $Api({

                    baseURI: $config.urls.staticUrl,
                    uri:     '/locales/:country/:lang',
                    ext:     'js',

                    retrieve: function(options) {
                        var api = this;
                        var model = options.model;

                        return $q(function(resolve) {

                            if (contentCache[model.country] && contentCache[model.country][model.lang]) {
                                return resolve(contentCache[model.country][model.lang]);
                            }

                            var uri    = api.getURI(model);

                            $logger.info('retrieve_content', {
                                uri: uri
                            });

                            var script = document.createElement('script');
                            script.setAttribute('src', uri);

                            $rootScope.$emit('loading');

                            var retrieved;

                            script.onload = function() {
                                retrieved = true;
                                $rootScope.$emit('loaded');

                                $logger.info('content_retrieved', {
                                    uri: uri
                                });

                                resolve(contentCache[model.country][model.lang]);
                            };

                            script.onerror = function() {
                                $timeout(function() {
                                    throw new Error('content_loading_error');
                                });
                            }

                            $timeout(function() {
                                if (!retrieved) {
                                    throw new Error('content_loading_timed_out');
                                }
                            }, 10000);

                            document.body.appendChild(script);

                        }).then(function(content) {
                            model.setProperties(content);
                            return content;
                        });
                    }
                }),

                change: function(country, lang) {

                    if (country === this.country && lang === this.lang) {
                        return $q.when(this);
                    }

                    this.country = country;
                    this.lang = lang;

                    return this.reload();
                }
            });
        })

        .factory('$LocaleModel', function($Model, $ContentModel, $rootScope, $q, $config, $logger) {
            return $Model.extend('LocaleModel', {

                init: function() {
                    this._super.init.apply(this);
                    $rootScope.locale = this;
                    this.content = $ContentModel.instance();
                },

                change: function(country, lang) {

                    if (country === this.country && lang === this.lang) {
                        return $q.when(this);
                    }

                    $logger.info('locale_change', {
                        country: country,
                        lang: lang
                    });

                    this.country = country;
                    this.lang = lang;

                    return this.content.change(country, lang)
                        ['finally'](function() {
                            $rootScope.$emit('localeChange');
                        });
                },

                content: function(){
                    return this.content.instance();
                }
            });
        })

        .factory('$locale', function($LocaleModel) {
            return $LocaleModel.instance();
        })

        .factory('$renderContent', function($rootScope, $sanitize, $logger, $loader) {

            var missing_prop_logged = [];

            return function(key, props, html) {
                props = props || {};

                var value = $rootScope.locale.content.get(key);

                //$util.assert(value, 'Content property not found: ' + key);

                if (!value) {
                    return;
                }

                if (typeof value === 'string') {
                    value = value.replace(/\{\w+\}/g, function (prop) {
                        prop = prop.slice(1, prop.length - 1);

                        if (!props[prop]) {

                            if (!$loader.isLoading()) {
                                var qualified_name = key + ':' + prop;

                                if (!~missing_prop_logged.indexOf(qualified_name)) {
                                    $logger.warn('missing_content_prop', {
                                        key: key,
                                        prop: prop
                                    });
                                }

                                missing_prop_logged.push(qualified_name);
                            }

                            return '';
                        }

                        if (html) {

                            try {
                                return $sanitize(props[prop])
                                    .replace(/&/g, '&amp;')
                                    .replace(/</g, '&lt;')
                                    .replace(/>/g, '&gt;')
                                    .replace(/"/g, '&quot;')
                                    .replace(/'/g, '&#39;')
                                    .replace(/\//g, '&#x2F;');
                            }
                            catch(e) {

                                $logger.error('sanitize_error', {
                                    key: key,
                                    prop: prop,
                                    value: props[prop]
                                });

                                return '';
                            }
                        }

                        return props[prop];
                    });
                }

                return value;
            }
        })

        .directive('content', function($renderContent, $sce) {

            var safeHtmlCache = {};

            return {
                restrict: 'A',

                link: function($scope, element, attributes) {
                    $scope.content = function(key, props) {
                        return $renderContent(attributes.content + '.' + key, props);
                    }

                    $scope.htmlContent = function(key, props) {
                        var html = $renderContent(attributes.content + '.' + key, props, true);
                        return safeHtmlCache[html] || (safeHtmlCache[html] = $sce.trustAsHtml(html));
                    }
                }
            }
        })

        .directive('bindHtmlCompile', function ($compile) {
            return {
                restrict: 'A',
                link: function ($scope, $element, $attrs) {
                    $scope.$watch(function () {
                        return $scope.$eval($attrs.bindHtmlCompile);
                    }, function (value) {
                        $element.html(value);
                        $compile($element.contents())($scope);
                    });
                }
            };
        })

        .directive('formatCurrency', function ($compile) {
            return {
                restrict: 'E',
                template: '{{ amount_formatted }}',
                scope: {
                    amount: '=',
                    symbol: '=',
                    code:   '=',
                    displayCode: '@'
                },
                controller: function ($rootScope, $scope, $locale) {
                    function format() {
                        var amount = $scope.amount.split('.');

                        var langConfig = (COUNTRY_FORMAT[$locale.country] || {})[$locale.lang] || {};

                        var dot = langConfig['.'] || '.';
                        var comma = langConfig[','] || ',';

                        amount = amount[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, comma) + dot + (amount[1] || '00');

                        if ($scope.code) {
                            amount = CURRENCY_SYMBOLS[$scope.code] + amount;
                            if ($scope.displayCode) {
                                amount = amount + ' ' + $scope.code;
                            }
                        }

                        $scope.amount_formatted = amount;
                    }


                    $rootScope.$on('localeChange', format);

                    if ($locale.country) {
                        format();
                    }
                }
            };
        })

        .run(function($rootScope, $LocaleModel) {
            $rootScope.locale = new $LocaleModel;
        })
});
