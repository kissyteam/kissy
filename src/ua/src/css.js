/**
 * @ignore
 * @fileOverview attach ua to class of html
 * @author yiminghe@gmail.com
 */
KISSY.add('ua/css', function (S, UA) {
    var o = [
            // browser core type
            'webkit',
            'trident',
            'gecko',
            'presto',
            // browser type
            'chrome',
            'safari',
            'firefox',
            'ie',
            'opera'
        ],
        doc = S.Env.host.document,
        documentElement = doc && doc.documentElement,
        className = '',
        v;
    if (documentElement) {
        S.each(o, function (key) {
            if (v = UA[key]) {
                className += ' ks-' + key + (parseInt(v) + '');
                className += ' ks-' + key;
            }
        });
        documentElement.className = S.trim(documentElement.className + className);
    }
}, {
    requires: ['./base']
});

/*
 refer :
 - http://yiminghe.iteye.com/blog/444889
 */