'use strict';

var kraken = require('kraken-js'),
    express = require('express'),
    app = express(),
    options = require('./lib/spec')(),
    port = process.env.PORT || 8007,
    appErrors = require("hawk-lib").appErrorHandler,
    calUtils = require('hawk-lib').util.cal;

if (require.main.filename === __filename) {

    app.use(kraken(options));

    app.listen(port, function (err) {
        if (err) {
            console.error(err.message);
        } else {
            console.log('[%s] Listening on http://localhost:%d', app.settings.env.toUpperCase(), port);
        }
    });
}

module.exports = app;
