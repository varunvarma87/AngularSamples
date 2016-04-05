define([
    'angular',
    'squid/index',
    './country',
    './language'
], function (angular, squid) {

    return squid.module('locale.resolvers', [
        'locale.resolvers.country',
        'locale.resolvers.language'
    ])
    .service('$LocaleResolver', function($LocaleModel,
                                             $Class,
                                             $util,
                                             $logger,
                                             $q){

        var LocaleResolver = $Class.extend('LocaleResolver', {

            resolvePromiseChain: function(resolvers, validator, args){

                var self    = this;
                var promise = $q.when();
                var result;

                angular.forEach(resolvers, function(resolver) {

                    promise = promise.then(function() {

                        if (result) {
                            return result;
                        }

                        return $q.when(resolver.method.apply(self, args))
                            .then(function(resolved) {

                                if (resolved && validator(resolved)) {
                                    return result = {
                                        resolver: resolver.name,
                                        resolved: resolved
                                    };
                                }
                            })

                    }, angular.noop);
                });

                return promise;
            },

            resolveCountry: function(){

                var promiseChain = $q.when();;
                var self = this;

                var validator = function(country){
                    return Boolean(country && self.supportedCountries[country]);
                }
                return self.resolvePromiseChain(self.countryResolvers, validator)
                    .then(function(resolved){
                        $logger.debug('resolve_country', {
                            country: resolved.resolved,
                            resolver: resolved.resolver
                        });
                        return resolved.resolved;
                    });
            },

            resolveLanguage: function(country){

                var promiseChain = $q.when();;
                var self = this;

                var validator = function(language){
                    return Boolean(~self.supportedCountries[country].indexOf(language));
                }

                return self.resolvePromiseChain(self.languageResolvers, validator, [country])
                    .then(function(resolved){
                        $logger.debug('resolve_lang', {
                            lang: resolved.resolved,
                            resolver: resolved.resolver
                        });
                        return resolved.resolved;
                    });

            },

            setUserPreferredCountry: function(country){
                $util.assert(country, 'No country provided');
                this.userPreferredCountry = country;

            },

            setUserPreferredLanguage: function(language){
                $util.assert(language, 'No language provided');
                this.userPreferredLanguage = language;
            },

            register: function(CountryResolvers, LanguageResolvers, supportedCountries){
                
		$util.assert(!this.countryResolvers, 'CountryResolvers already registered');
                $util.assert(!this.languageResolvers, 'LanguageResolvers already registered');
                $util.assert(!this.supportedCountries, 'SupportedCountries already registered');

                $util.assert( CountryResolvers instanceof Array, "CountryResolvers must be array");
                $util.assert( LanguageResolvers instanceof Array, "LanguageResolver must be array");
                $util.assert( supportedCountries, "supportedCountries must be passed");

                this.countryResolvers = CountryResolvers;
                this.languageResolvers = LanguageResolvers;
                this.supportedCountries = supportedCountries;
            },

            resolve: function(){

                $util.assert(this.countryResolvers, 'No CountryResolver registered');
                $util.assert(this.languageResolvers, 'No LanguageResolver registered');
                $util.assert(this.supportedCountries, 'No SupportedCountries registered');

                var self = this;

                function resolveCountry(){
                    if(self.userPreferredCountry){
                        return $q.when(self.userPreferredCountry);
                    } else {
                        return self.resolveCountry();
                    }
                }

                function resolveLanguage(country){
                    if(self.userPreferredLanguage){
                        return $q.when(self.userPreferredLanguage);
                    }else{
                        return self.resolveLanguage(country);
                    }

                }

                return resolveCountry()
                    .then(function(country){
                        return resolveLanguage(country)
                            .then(function(language){
                                return {
                                    language: language,
                                    country: country
                                }
                            });
                    })
                    .then(function(result){
                        var Locale = $LocaleModel.instance();
                        return Locale.change(result.country, result.language);
                    });
            }

        });

        return new LocaleResolver;
    });

});
