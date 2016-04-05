'use strict';

define(['angular',
    './class',
    './config',
    './error',
    './util',
    'components/xo-beaver/dist/logger'
], function (angular) {

    angular.module('squid.api',[
        'squid.class',
        'squid.config',
        'squid.error',
        'squid.util',
        'beaver'
    ])

        .factory('$Api', function($q,
                                  $rootScope,
                                  $http,
                                  $util,
                                  $Class,
                                  $Contingency,
                                  $Forbidden,
                                  $ApiError,
                                  $config,
                                  $timeout,
                                  $log,
                                  $injector,
                                  $logger) {

            $rootScope.csrfJWT = $config.csrfJwt;

            var cookiesEnabled = $util.cookiesEnabled() && ~window.location.hostname.indexOf('.paypal.com');
            var cookies        = $config.encryptedCookies || {};

            var cache = {};

            var pre;

            var ERROR_STATE = false;

            var apiReady = $util.ready.then(function() {
                pre = $util.elementJSON('preloaded_data');
            });

            return $Class.extend('Api', {

                // URI to prepend to each api call, e.g. /webapps/helios
                baseURI: $config.urls.baseUrl,

                ack: true,
                event: true,
                cache: false,
                timeout: 45000,
                meta: true,

                getAttempts: 3,
                postAttempts: 1,

                action: function(action, options) {
                    options.action = action;
                    return this.post(options);
                },

                retrieve: function(options) {
                    return this.call('get', options);
                },

                post: function(options) {
                    return this.call('post', options);
                },

                call: function(method, options) {

                    var api = this;
                    var apiName = this.buildAPIName(options);

                    if (ERROR_STATE) {
                        return $q(function() {})
                    }

                    return apiReady.then(function() {

                        var uri = api.getURI(options.model, options.action);
                        var doCache = api.cache && method === 'get';


                        $logger.info(apiName + '_call', {
                            method: method,
                            uri:    uri
                        });

                        var req;

                        if (doCache && cache[uri]) {
                            req = cache[uri];
                        }

                        else {
                            req = api.buildRequest(method, uri, options);
                        }

                        if (doCache) {
                            cache[uri] = req;
                        }

                        if (api.event && !options.silent) {
                            $rootScope.$emit('loading');
                        }

                        return req['finally'](function() {

                            if (api.event && !options.silent) {
                                $rootScope.$emit('loaded');
                            }

                        }).then(function(res) {

                            $logger.info('api_response', {
                                method: method,
                                uri:    uri,
                                client: res.data && res.data.client
                            });

                            return api.handleResponse(method, uri, res.data, options);

                        });
                    });
                },

                buildRequest: function(method, uri, options) {
                    var api = this;

                    options.params = options.params || {};

                    var meta = this.buildMeta();
                    if (meta && method === 'get') {
                        options.params.meta = JSON.stringify(meta);
                    }

                    var attempts = method.toLowerCase() === 'get' ? this.getAttempts : this.postAttempts;
                    var permissionDeniedRetry = false;

                    function doRequest() {

                        var req;

                        if (pre[uri]) {

                            if (pre[uri].ack === 'error') {
                                req = $q.reject({
                                    status: 500,
                                    data: pre[uri]
                                })
                            }
                            else {
                                req = $q.when({
                                    status: 200,
                                    data: pre[uri]
                                });
                            }

                            delete pre[uri];
                        }
                        else {

                            var request = {
                                method: method,
                                url:    uri,
                                data:   {
                                    data: options.data,
                                    meta: meta || {}
                                },
                                headers: {
                                    'X-Requested-With': 'XMLHttpRequest',
                                    'x-csrf-jwt': $rootScope.csrfJWT
                                },
                                params: options.params,
                                requestType: 'json',
                                responseType: 'json',
                                timeout: api.timeout
                            };

                            if (!cookiesEnabled) {
                                request.headers['X-cookies'] = JSON.stringify(cookies);
                            }

                            req = $http(request).then(function(res) {

                                $rootScope.csrfJWT = res.headers('x-csrf-jwt') || $rootScope.csrfJWT;

                                if (!cookiesEnabled && res.headers('X-cookies')) {
                                    angular.extend(cookies, JSON.parse(res.headers('X-cookies')));
                                }

                                return res;

                            }, function(res) {

                                $rootScope.csrfJWT = res.headers('x-csrf-jwt') || $rootScope.csrfJWT;

                                return $q.reject(res);
                            });
                        }

                        return req['catch'](function(res) {
                            attempts -= 1;

                            if (res.status === 401) {

                                if (attempts < 0) {
                                    return {
                                        data: {
                                            ack: 'permission_denied'
                                        }
                                    };
                                }

                                else if (attempts === 0) {

                                    $logger.warn('api_retry_401', {
                                        method: method,
                                        uri: uri
                                    });

                                    return doRequest();
                                }
                            }

                            if (attempts) {

                                $logger.info('api_retry', {
                                    method: method,
                                    uri: uri
                                });

                                return doRequest();
                            }

                            ERROR_STATE = true;

                            if (res && res.data && res.data.ack === 'error') {

                                $logger.info(api.buildAPIName(options) + '_error', {
                                    method: method,
                                    uri:    uri,
                                    message: res.data.message
                                });

                                throw new $ApiError(uri + ': ' + res.data.message);
                            }
                            else if (res && res.status) {
                                throw new $ApiError(uri + ' returned status code ' + res.status);
                            }
                            else {
                                throw new $ApiError(uri + ' - request aborted');
                            }
                        });
                    }

                    return doRequest();
                },

                handleResponse: function(method, uri, res, options) {
                    var api = this;
                    var apiName = this.buildAPIName(options);

                    return $q.when().then(function() {

                        if (!api.ack) {
                            res = {
                                ack: 'success',
                                data: res
                            }
                        }

                        var resultModel = options.resultModel || options.model;

                        if (res.data && resultModel) {

                            if (resultModel.populate) {
                                resultModel.populate(res.data);
                            }
                            else {
                                angular.extend(resultModel, res.data);
                            }
                        }

                        if (res.ack === 'success') {

                            $logger.info(apiName + '_success', {
                                method: method,
                                uri:    uri
                            });



                            if (options.success) {
                                if (typeof options.success === 'function') {
                                    return options.success(res.data);
                                }
                                return options.success;
                            }
                        }

                        else if (res.ack === 'contingency') {

                            $logger.info(apiName + '_contingency', {
                                method: method,
                                uri:    uri,
                                contingency: res.contingency
                            });

                            $util.assert(res.contingency, uri + ': expected contingency name in response');

                            var contingency = new $Contingency(res.contingency);

                            if(resultModel) {
                                resultModel.errorData = res.errorData || {};
                            }

                            var handler = options.contingencies &&
                                (options.contingencies[contingency.message] || options.contingencies['DEFAULT']);

                            if (handler) {
                                if (typeof handler === 'function') {
                                    angular.extend(contingency, res.errorData);
                                    return handler(contingency.message, contingency);
                                }
                                return handler;
                            }

                            throw contingency;
                        }

                        else if (res.ack === 'validation') {

                            $logger.info(apiName + '_validation', {
                                method: method,
                                uri:    uri,
                                validation: res.validation
                            });

                            if (options.validation) {
                                return options.validation(res.validation);
                            }

                            throw new Error(uri + ': returned validation errors');
                        }

                        else if (res.ack === 'permission_denied') {

                            $logger.info(apiName + '_denied', {
                                method: method,
                                uri:    uri
                            });

                            throw new $Forbidden(uri + ': forbidden');
                        }

                        else {

                            $logger.info(apiName + '_noack', {
                                method: method,
                                uri:    uri
                            });

                            throw new $ApiError(uri + ': response ack: ' + res.ack);
                        }

                        return res;
                    });
                },

                getURI: function(model, action) {
                    var self = this;

                    var uri = [];

                    uri.push(this.uri.replace(/\/:[\w\.]+\?/g, function(key) {
                        key = key.slice(2);
                        key = key.substring(0, key.length -1);

                        var component = model.get ? model.get(key) : model[key];

                        if (!component) {
                            return '';
                        }

                        return '/' + component;

                    }).replace(/:[\w\.]+/g, function(key) {
                        key = key.slice(1);

                        var component = model.get ? model.get(key) : model[key];

                        if (!component) {
                            throw new Error('Property "' + key + '" not found in model when trying to build: ' + self.uri);
                        }

                        return component;
                    }));

                    if (action) {
                        uri.push(action);
                    }

                    if (this.ext) {
                        uri[uri.length - 1] += ('.' + this.ext);
                    }

                    return this.baseURI + '/' + uri.join('/').replace(/\/{2,}/g, '/').replace(/^\//, '');
                },

                buildMeta: function(){
                    if (!this.meta) {
                        return;
                    }

                    try {
                        var metaBuilder = $injector.get('$metaBuilder');
                        return metaBuilder.build();
                    }catch(err){
                        if ($config.deploy.isLocal() || $config.deploy.isStage()) {
                            $log.debug(err);
                        }
                        return;
                    }

                },

                buildAPIName: function(options){
                    var api = this;
                    var apiName = api.uri.
                        replace(/^\/+/, ''). // Remove leading '/'
                        replace(/\//g, '_'). // Replace remaining '/' with '_'
                        replace(/\?(.*)/, '').//Remove everything after '?'
                        replace(/[^a-zA-Z0-9_]/g, '');
                    apiName = options.action ? apiName+ "_" + options.action : apiName;
                    apiName = apiName.charAt(0) === '_' ? apiName.slice(1): apiName;
                    return apiName;
                }

            });
        });
});
