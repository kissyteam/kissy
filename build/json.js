/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Nov 9 16:14
*/
/**
 * @ignore
 * @fileOverview kissy json use json2 or native conditionally
 */
KISSY.add('json', function (S, JSON) {

    JSON = JSON || window.JSON;

    /**
     * Provide json utils for KISSY.
     * @class KISSY.JSON
     * @singleton
     */
    return S.JSON = {

        /**
         * Parse json object from string.
         * @param text
         * @return {Object}
         */
        parse: function (text) {
            // 当输入为 undefined / null / '' 时，返回 null
            if (text == null || text === '') {
                return null;
            }
            return JSON.parse(text);
        },
        /**
         * serialize json object to string.
         * @method
         * @param {Object} jsonObject
         * @return {String}
         */
        stringify: JSON.stringify
    };
}, {
    requires: [
        KISSY.Features.isNativeJSONSupported ?
            "empty" :
            "json/json2"
    ]
});
