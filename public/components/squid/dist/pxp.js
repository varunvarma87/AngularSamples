'use strict';

define(['angular', './model'], function (angular) {
    return angular.module('squid.pxp', ['squid.model'])

        .factory('$PXPModel', function($Model, $Api, $config) {
            return $Model.extend({
                api: new $Api({
                    uri: '/api/pxp/:id'
                })
            })
        })

        .factory('$getPxpTreatments', function($PXPModel, $util) {
            return function(id, params) {

                var pxp = $PXPModel.create(id);

                return pxp.retrieve({
                    params: params

                }).then(function() {
                    return pxp.treatments;
                })
            }
        })

        .factory('$pxp', function($PXPModel, $util, $getPxpTreatments) {
            return function(id, params, pattern) {

                if (!pattern) {
                    pattern = params;
                    params  = {};
                }

                pattern = new RegExp('^' + pattern + '$');

                return $getPxpTreatments(id, params)
                    .then(function(treatments) {
                        return $util.some(treatments, function(treatment) {
                                return pattern.test(treatment);
                            }) || false;
                    });
            }
        })

        .factory('$experiment', function($logger) {
            return function(name, throttle) {

                var enabled = Math.random() < throttle;
                var logName = name + '_' + (enabled ? 'test' : 'control');

                $logger.info(logName);

                $logger.info(name, {
                    enabled: enabled
                });

                return enabled;
            }
        })

        .run(function($pxp) {
            window.$pxp = $pxp;
        });
});
