/**
 * @ignore
 *  kissy json use json2 or native conditionally
 */
KISSY.add('json', function (S, J) {

    if (!J) {
        J = JSON;
    }

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
            return J.parse(text);
        },
        /**
         * serialize json object to string.
         * @method
         * @param {Object} jsonObject
         * @return {String}
         */
        stringify: J.stringify
    };
}, {
    requires: [
        KISSY.Features.isNativeJSONSupported() ? "" : "json/json2"
    ]
});
