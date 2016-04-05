'use strict';


var ppauth = require('auth-paypal'),
    appErrors  = require('hawk-lib').appErrorHandler,
    calUtils = require('hawk-lib').util.cal,
    appUtils = require("hawk-lib").util.app,
    i18n = require('makara'),
    provider = i18n.create({contentPath: process.cwd()+'/locales', fallback: 'en_US', templatePath: process.cwd()+'/public/templates'}),
    middlewareUtils = require('../controllers/middleware/middleware-utils');

module.exports = function (router) {
    /* Custom handlers for login */
    var loginurl = appUtils.isDevelopmentEnv() ? '/angularTaxId/signin' : '/signin';

    function authenticate(req, res, next) {
        ppauth.login(
            {successRedirect: req.body.returnUrl, failureRedirect: loginurl+'?returnUrl='+encodeURIComponent(req.body.returnUrl)}
        )(req, res, next);
    }

    function authorize(req, res, next) {
        //calUtils.logInfo("Authorization");
        var fullLoginUrl = loginurl +'?returnUrl='+encodeURIComponent(req.baseUrl);
        ppauth.authorize(function (err, user, info) {
            if (err) {
                //calUtils.logAsSystemError("Authorization failed: ", err);
                return next(err);
            }
            if (!user) {
                res.redirect(fullLoginUrl);
                return;
            }
                next();
        })(req, res, next);
    }

    function getModel(templateName, req) {
        var model = {
                requestURI: req.app.kraken.get('requestURI'),
                viewName: templateName
            },
            currentEnv = (process.env.DEPLOY_ENV) ? process.env.DEPLOY_ENV.toLowerCase() : 'dev';

        model.PayPalCDN = 'www.paypalobjects.com';
        if(templateName === "ColorSelector") {
            model.appjs = "app";
        }
        if(templateName === "proTransactionTypes") {
            var isAuth = '';
            if (req.query.isAuth) {
                isAuth = req.query.isAuth.toLowerCase();
            }
            model.isAuth = isAuth;
        }
        if(currentEnv === 'stage' || currentEnv === 'staging') {
            model.pisces = true;
        }
        return model;
    }

     /* Login */
    router.get('/signin', middlewareUtils.processHijack, function (req, res) {
        var returnUrl = (req.query.returnUrl) ? req.query.returnUrl:"/";

        var model = {
                requestURI: req.app.kraken.get('requestURI'),
                viewName: 'signin'
        };
        model.returnUrl = returnUrl;
        res.render('signin', model);
    });
    router.post('/signin', middlewareUtils.processHijack, authenticate);

    /* Authorize for all non -outside pages */
    router.use( /(^\/(?!signin|signout|((.*)-outside))(.*))$/, authorize);

    router.get('/TaxIDNg*', function(req, res) {
        var model = getModel("angularTaxId", req);
        res.render(model.viewName, model);
    });

    router.get('/listTaxID', function(req, res) {
        var servicecore = require('servicecore');
        var taxWrapper = servicecore.create('ppaas', {
            service: 'walletsettingserv',
            scopes: ['https://uri.paypal.com/services/customer/users/tax-id/view']
        });

        // GET request
        taxWrapper.request({
            method: 'GET',
            path: '/v1/customer/users/@me/tax-id',
            qs: 'page=0&page_size=10'
        }, function (err, response) {
            provider.getBundle('angularTaxId', 'en_US', function (err, bundle) {
                var resp,
                    crunchedResp = [],
                    numb = '',
                    isPresent = false,
                    taxTypes = [
                        {'type': 'SSN', 'display':bundle.get('angularTaxId.SSN'), 'value': 'xxx-xx-xxxx', 'numberFormat': ['xxx','xx','xxxx']},
                        {'type': 'ITIN', 'display':bundle.get('angularTaxId.ITIN'), 'value': 'xxx-xx-xxxx', 'numberFormat': ['xxx','xx','xxxx']},
                        {'type': 'EIN', 'display':bundle.get('angularTaxId.EIN'), 'value': 'xx-xxxxxxx', 'numberFormat': ['xx','xxxxxxx']}
                    ];
                if(response.statusCode === 200) {
                    resp = response.body;
                    for(var i in taxTypes) {
                        isPresent = false;
                        for(var j in resp) {
                            if(taxTypes[i].type === resp[j].type) {
                                numb = taxTypes[i].value;
                                numb = numb.slice(0, -2);
                                numb += resp[j].value.slice(-2);
                                taxTypes[i].value = numb;
                                taxTypes[i].isPresent = true;
                                crunchedResp.push(taxTypes[i]);
                                isPresent = true;
                                break;
                            }
                        }
                        if(!isPresent) {
                            crunchedResp.push(taxTypes[j]);
                        }
                    }
                } else {
                    crunchedResp = {'error': bundle.get('angularTaxId.errorMsg')};
                }
                res.set('Content-Type', 'application/json');
                res.send(crunchedResp);
            });
        });
    });

    router.all('/putTaxID', function(req, res, next) {
        var resp = [],
            data = {};
        data.type = req.body.type;
        data.value = req.body.value;
        //res.set('Content-Type', 'application/json');
        //res.send(resp);

        var servicecore = require('servicecore'),
            taxWrapper = servicecore.create('ppaas', {
            service: 'walletsettingserv',
            scopes: ['https://uri.paypal.com/services/customer/users/tax-id/update']
        });

        // PUT request
        taxWrapper.request({
            method: 'PUT',
            path: '/v1/customer/users/@me/tax-id',
            body: JSON.stringify(data)
        }, function (err, response) {
            res.set('Content-Type', 'application/json');
            provider.getBundle('angularTaxId', 'en_US', function (err, bundle) {
                if (!err && response.statusCode === 200) {
                    res.send({'success': bundle.get('angularTaxId.done')});
                } else if (!err && response.statusCode === 400) {
                    res.status(400).send({'error': response.body.message});
                } else {
                    res.status(500).send({'error': bundle.get('angularTaxId.err500')});
                }
            });
        });
    });

};
