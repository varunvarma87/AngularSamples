define([], function(){

    return {
        /**
         *
         * @param locale - Ex: en_US
         * @returns {{country: *, dialect}}
         */
        normalizeLocale:  function normalizeLocale(locale){
            if(!locale) return {};

            locale = locale.replace('-', "_");

            var country, language;

            if (locale.match(/^\w{2}_\w{2}$/)) {
                locale = locale.split("_");

                language = locale[0];
                country = locale[1];
            }
            else{
                language = locale;
            }
            return {
                country: country,
                language: language
            }
        }
    };
})

