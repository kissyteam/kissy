/**
 * @ignore
 * 1. export KISSY 's functionality to module system
 * 2. export light-weighted json parse
 */
(function (S) {

    /**
     * @ignore
     * export KISSY 's functionality to module system
     */
    (function (S) {

        // empty mod for conditional loading
        S.add('empty', S.noop);

        S.add('promise', function () {
            return S.Promise;
        });

        S.add('ua', function () {
            return S.UA;
        });

        S.add('uri', function () {
            return S.Uri;
        });

        S.add('path', function () {
            return S.Path
        });

    })(KISSY);

    // exports for nodejs
    if (S.UA.nodejs) {
        S.KISSY = S;
        module.exports = S;
    }

})(KISSY);