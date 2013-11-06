/**
 * @ignore
 * init loader, set config
 */
(function (S) {
    var doc = S.Env.host && S.Env.host.document;
    // var logger = S.getLogger('s/loader');
    var Utils = S.Loader.Utils;
    var TIMESTAMP = '@TIMESTAMP@';

    function returnJson(s) {
        return (new Function('return ' + s))();
    }

    var baseReg = /^(.*)(seed|kissy)(?:-min)?\.js[^/]*/i,
        baseTestReg = /(seed|kissy)(?:-min)?\.js/i;

    function getBaseInfoFromOneScript(script) {
        // can not use KISSY.Uri
        // /??x.js,dom.js for tbcdn
        var src = script.src || '';
        if (!src.match(baseTestReg)) {
            return 0;
        }

        var baseInfo = script.getAttribute('data-config');

        if (baseInfo) {
            baseInfo = returnJson(baseInfo);
        } else {
            baseInfo = {};
        }

        var comboPrefix = baseInfo.comboPrefix = baseInfo.comboPrefix || '??';
        var comboSep = baseInfo.comboSep = baseInfo.comboSep || ',';

        var parts ,
            base,
            index = src.indexOf(comboPrefix);

        // no combo
        if (index == -1) {
            base = src.replace(baseReg, '$1');
        } else {
            base = src.substring(0, index);
            // a.tbcdn.cn??y.js, ie does not insert / after host
            // a.tbcdn.cn/combo? comboPrefix=/combo?
            if (base.charAt(base.length - 1) != '/') {
                base += '/';
            }
            parts = src.substring(index + comboPrefix.length).split(comboSep);
            S.each(parts, function (part) {
                if (part.match(baseTestReg)) {
                    base += part.replace(baseReg, '$1');
                    return false;
                }
                return undefined;
            });
        }

        return S.mix({
            base: base,
            // kissy 's tag will be determined by build time and user specified url
            tag: Utils.getHash(TIMESTAMP + src)
        }, baseInfo);
    }

    /**
     * get base from seed.js
     * @return {Object} base for kissy
     * @ignore
     *
     * for example:
     *      @example
     *      http://a.tbcdn.cn/??s/kissy/x.y.z/seed-min.js,p/global/global.js
     *      note about custom combo rules, such as yui3:
     *      combo-prefix='combo?' combo-sep='&'
     */
    function getBaseInfo() {
        // get base from current script file path
        // notice: timestamp
        var scripts = doc.getElementsByTagName('script'),
            i,
            info;

        for (i = scripts.length - 1; i >= 0; i--) {
            if (info = getBaseInfoFromOneScript(scripts[i])) {
                return info;
            }
        }

        S.log('must load kissy by file name in browser environment: seed.js or seed-min.js', 'error');
        return null;
    }

    S.config({
        charset: 'utf-8',
        lang: 'zh-cn',
        tag: TIMESTAMP
    });

    if (S.UA.nodejs) {
        // nodejs: no tag
        // noinspection JSUnresolvedVariable
        S.config({
            charset: 'utf-8',
            base: __dirname.replace(/\\/g, '/').replace(/\/$/, '') + '/'
        });
        // ejecta
    } else if (doc && doc.getElementsByTagName) {
        // will transform base to absolute path
        S.config(S.mix({
            // 2k(2048) url length
            comboMaxUrlLength: 2000,
            // file limit number for a single combo url
            comboMaxFileNum: 40
        }, getBaseInfo()));
    }
})(KISSY);