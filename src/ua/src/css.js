/**
 * attach ua to class of html
 * @author yiminghe@gmail.com
 */
KISSY.add("ua/css", function (S, UA) {
    var o = [
        // browser core type
        "webkit",
        "trident",
        "gecko",
        "presto",
        // browser type
        "chrome",
        "safari",
        "firefox",
        "ie",
        "opera"
    ],
        documentElement = S.Env.host.document.documentElement,
        className = "",
        v;
    S.each(o, function (key) {
        if (v = UA[key]) {
            className += " ks-" + key + ((v + "").replace(/\./g, "_"));
            className += " ks-" + key;
        }
    });
    documentElement.className = S.trim(documentElement.className + className);
}, {
    requires:['./base']
});

/**
 * refer :
 *  - http://yiminghe.iteye.com/blog/444889
 */