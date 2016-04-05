/**
 * @name: middleware-utils
 * @author: Pidathala Venkata <pchallapathy@paypal.com>
 * @brief: Middleware to perform utils functionalaity for controllers.
 **/
'use strict';

module.exports = {

    /**
     * @name: processHijack
     * @brief: checks if LIVE or STAGING env, and redirects user to /login.
     *            used to bypass certain controllers.
     * @param: {obj} request
     * @param: {obj} response
     * @param: {function} next
     **/
    processHijack: function (req, res, next) {
        if (process.env.DEPLOY_ENV === 'LIVE') {
            res.redirect('/');
        } else {
            next();
        }
    }
};