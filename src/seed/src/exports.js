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

    var UA = S.UA,
        Env = S.Env,
        win = Env.host,
        doc = win.document || {},
        documentMode = doc.documentMode,
        nativeJSON = ((UA.nodejs && typeof global === 'object') ? global : win).JSON;

    // ie 8.0.7600.16315@win7 json bug!
    if (documentMode && documentMode < 9) {
        nativeJSON = null;
    }

    if (nativeJSON) {
        KISSY.add('json', function () {
            return S.JSON = nativeJSON;
        });
    }

    // exports for nodejs
    if (S.UA.nodejs) {
        S.KISSY = S;
        module.exports = S;
    }

})(KISSY);