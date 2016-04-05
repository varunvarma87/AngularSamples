define([ /* no-op */ ], function () {

    /* This is fraudnet JS. Renamed as "fn", to avoid the word "fraud" being loaded in the browser. */

    "use strict";

    // This will not and cannot ever change.
    var fncls = 'fnparams-dede7cc5-15fd-4c75-a9f4-36c430ee3a99';

    function _injectConfig(options) {
        var script = document.getElementById('fconfig');

        if (script) {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        }

        script = document.createElement('script');
        script.id = 'fconfig';
        script.type = 'application/json';
        script.setAttribute('fncls', fncls);

        script.text = '{"f":"' + options.fnSessionId + '","s":"' + options.sourceId + '"}';

        document.body.appendChild(script);
    }

    function _loadBeaconJS(options) {
        try {
            require([options.fnUrl], function () {
                if (runFb) {
                    runFb({
                        f: options.fnSessionId,
                        s: options.sourceId
                    });
                }
            }, function (err) {
                //console.log("FN beacon ignored in development mode.");
            });
        }
        catch(e) {

        }
    }

    function trigger(options) {
        /*
         HACK: If we're in the Mica flow and have already triggered the beacon on the CYCO page,
         don't trigger it on the login page.
         We can remove this once the new "cdn2" script is available by 03/14.
         */
        if (options) {
            _injectConfig(options);
            _loadBeaconJS(options);
        }
    }

    return {
        trigger: trigger
    };
});
