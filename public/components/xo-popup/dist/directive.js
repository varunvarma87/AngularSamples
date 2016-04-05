"use strict";
define(['squid/index'], function(squid) {
    squid.module('xocomponent', ['squid'])
        .directive('xoPopup', function($window) {
            return {
                restrict: 'A',

                link: function(scope, element, attr) {

                    element.on("click", function(event) {
                        event.preventDefault();
                        event.stopPropagation();

                        var features = "";
                        var customConfig = attr.xoPopup ? JSON.parse(attr.xoPopup) : {};
                        var config = {
                            popupUrl:       attr.href,
                            popupWindowName: "popup",
                            width:           835,
                            height:          500,

                            popupWindowFeatures: {
                                location:   1,
                                status:     1,
                                scrollbars: 1,
                                resizable:  1,
                                toolbar:    0,
                                menubar:    0
                            }
                        };
                        
                        if($(element).hasClass('smallPopup')) {
                            config.width = 385;
                        }

                        var left = 0;
                        var top = 0;

                        if (window.outerWidth) {
                            left = Math.round((window.outerWidth - config.width) / 2) + window.screenX;
                            top = Math.round((window.outerHeight - config.height) / 2) + window.screenY;
                        } else if (window.screen.width) {
                            left = Math.round((window.screen.width - config.width) / 2);
                            top = Math.round((window.screen.height - config.height) / 2);
                        }

                        for (var key in config.popupWindowFeatures) {
                            features += key + "=" + config.popupWindowFeatures[key] + ",";
                        }

                        // put together WindowFeatures, since, window.open needs it as a string
                        features += ",width=" + config.width + ",height=" + config.height + ",left=" + left + ",top=" + top;


                        var popup = $window.open(config.popupUrl, config.popupWindowName, features);




                        if (popup.focus) {
                            popup.focus();
                        }
                    });
                }
            }
        });
});
