'use strict';

define(['angular'], function (angular) {

    return function(name, dependencies) {
        var module;

        try {
            module = angular.module(name);
        }
        catch (e) {}

        if (module) {
            if (dependencies && module.requires.join(',') !== dependencies.join(',')) {
                throw new Error('Module ' + name + ' declared with differing sets of dependencies; ' +
                    'original: ' + module.requires.join(',') + ' / new: ' + dependencies.join(','));
            }

            return module;
        }

        return angular.module(name, dependencies || []);
    }
});
