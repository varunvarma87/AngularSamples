define([
    'squid/index',
    './model',
    'text!./template.html',
    './fn',
    'components/xo-popup/dist/directive'
], function (squid, model, template, fn) {

    squid.module('xocomponent', ['squid'])
        .directive('xoLogin', function () {

            return {
                template: template,
                scope: {
                    token: '=',
                    doneFn: '=',
                    errorFn: '=',
                    clientId: '=',
                    redirectUri: '=',
                    scope: '=',
                    autoLogin: '='
                },
                controller: function ($scope, $populate, $rootScope, $AuthModel, $LocaleModel, $config) {

                    $scope.locale = $LocaleModel.instance();
                    var fraudnetOptions = {
                        fnUrl: $config.urls.fraudnetUrl,
                        fnSessionId: $scope.token,
                        sourceId: "HERMES_SIGNIN"
                    };

                    function showLoadingMessage() {
                        $rootScope.$emit('loadingMessage', $rootScope.locale.content.get('xospartaweb.base.loggingIn'));
                    }

                    fn.trigger(fraudnetOptions);

                    $populate($scope, {
                        auth: $AuthModel.instance()
                    }).then(function() {

                        if ($scope.auth.loggedIn()) {
                            if ($scope.autoLogin) {
                                showLoadingMessage();
                                return $scope.doneFn($scope.auth);
                            }
                            else {
                                $scope.auth.action('logout');
                            }
                        }

                        $scope.onSubmit = function() {

                            showLoadingMessage();

                            var loginInput = {
                                user: {
                                    email:    $scope.auth.email,
                                    password: $scope.auth.password
                                }
                            };

                            if($scope.clientId) {
                                loginInput.client =  {
                                    client_id: $scope.clientId,
                                    redirect_uri: $scope.redirectUri,
                                    scope: $scope.scope,
                                    response_type: 'code',
                                    skip_oauth: false,
                                    skip_consent: false
                                }
                            }

                            $scope.auth.action('login', {

                                resultModel: $scope.auth,

                                data: loginInput,

                                success: function(result) {
                                    return $scope.doneFn($scope.auth);
                                },

                                contingencies: {
                                    DEFAULT: function handleContingency(name, contingency) {
                                        $scope.auth.password = '';
                                        return $scope.errorFn(name, contingency);
                                    }
                                }
                            });
                        };
                    });
                }
            };

        });
});
