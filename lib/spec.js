'use strict';


var brogan = require('brogan-paypal');


module.exports = function spec() {

    return {
        onconfig: brogan(function(config, next) {
            next(null, config);
        })
    };
};