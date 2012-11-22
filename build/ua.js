/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Nov 22 14:13
*/
/**
 * @ignore
 * @fileOverview ua
 */
KISSY.add('ua/base', function (S, undefined) {

    var win = S.Env.host,
        doc = win.document,
        navigator = win.navigator,
        ua = navigator && navigator.userAgent || "",
        EMPTY = '',
        os,
        MOBILE = 'mobile',
        core = EMPTY,
        shell = EMPTY, m,
        IE_DETECT_RANGE = [6, 9],
        v,
        end,
        VERSION_PLACEHOLDER = '{{version}}',
        IE_DETECT_TPL = '<!--[if IE ' + VERSION_PLACEHOLDER + ']><' + 's></s><![endif]-->',
        div = doc && doc.createElement('div'),
        s = [],
        /**
         * KISSY UA Module
         * @member KISSY
         * @class KISSY.UA
         * @singleton
         */
            UA = {
            /**
             * webkit version
             * @type undefined|Number
             * @member KISSY.UA
             */
            webkit: undefined,
            /**
             * trident version
             * @type undefined|Number
             * @member KISSY.UA
             */
            trident: undefined,
            /**
             * gecko version
             * @type undefined|Number
             * @member KISSY.UA
             */
            gecko: undefined,
            /**
             * presto version
             * @type undefined|Number
             * @member KISSY.UA
             */
            presto: undefined,
            /**
             * chrome version
             * @type undefined|Number
             * @member KISSY.UA
             */
            chrome: undefined,
            /**
             * safari version
             * @type undefined|Number
             * @member KISSY.UA
             */
            safari: undefined,
            /**
             * firefox version
             * @type undefined|Number
             * @member KISSY.UA
             */
            firefox: undefined,
            /**
             * ie version
             * @type undefined|Number
             * @member KISSY.UA
             */
            ie: undefined,
            /**
             * opera version
             * @type undefined|Number
             * @member KISSY.UA
             */
            opera: undefined,
            /**
             * mobile browser. apple, android.
             * @type String
             * @member KISSY.UA
             */
            mobile: undefined,
            /**
             * browser render engine name. webkit, trident
             * @type String
             * @member KISSY.UA
             */
            core: undefined,
            /**
             * browser shell name. ie, chrome, firefox
             * @type String
             * @member KISSY.UA
             */
            shell: undefined,

            /**
             * PhantomJS version number
             * @type undefined|Number
             * @member KISSY.UA
             */
            phantomjs: undefined,

            /**
             * operating system. android, ios, linux, windows
             * @type string
             * @member KISSY.UA
             */
            os: undefined,

            /**
             * ipad ios version
             * @type Number
             * @member KISSY.UA
             */
            ipad: undefined,
            /**
             * iphone ios version
             * @type Number
             * @member KISSY.UA
             */
            iphone: undefined,
            /**
             * ipod ios
             * @type Number
             * @member KISSY.UA
             */
            ipod: undefined,
            /**
             * ios version
             * @type Number
             * @member KISSY.UA
             */
            ios: undefined,

            /**
             * android version
             * @type Number
             * @member KISSY.UA
             */
            android: undefined
        },
        numberify = function (s) {
            var c = 0;
            // convert '1.2.3.4' to 1.234
            return parseFloat(s.replace(/\./g, function () {
                return (c++ === 0) ? '.' : '';
            }));
        };

    if (div) {
        // try to use IE-Conditional-Comment detect IE more accurately
        // IE10 doesn't support this method, @ref: http://blogs.msdn.com/b/ie/archive/2011/07/06/html5-parsing-in-ie10.aspx
        div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, '');
        s = div.getElementsByTagName('s');
    }

    if (s.length > 0) {

        shell = 'ie';
        UA[core = 'trident'] = 0.1; // Trident detected, look for revision

        // Get the Trident's accurate version
        if ((m = ua.match(/Trident\/([\d.]*)/)) && m[1]) {
            UA[core] = numberify(m[1]);
        }

        // Detect the accurate version
        // 注意：
        //  UA.shell = ie, 表示外壳是 ie
        //  但 UA.ie = 7, 并不代表外壳是 ie7, 还有可能是 ie8 的兼容模式
        //  对于 ie8 的兼容模式，还要通过 documentMode 去判断。但此处不能让 UA.ie = 8, 否则
        //  很多脚本判断会失误。因为 ie8 的兼容模式表现行为和 ie7 相同，而不是和 ie8 相同
        for (v = IE_DETECT_RANGE[0], end = IE_DETECT_RANGE[1]; v <= end; v++) {
            div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, v);
            if (s.length > 0) {
                UA[shell] = v;
                break;
            }
        }

    } else {

        // WebKit
        if ((m = ua.match(/AppleWebKit\/([\d.]*)/)) && m[1]) {
            UA[core = 'webkit'] = numberify(m[1]);

            // Chrome
            if ((m = ua.match(/Chrome\/([\d.]*)/)) && m[1]) {
                UA[shell = 'chrome'] = numberify(m[1]);
            }
            // Safari
            else if ((m = ua.match(/\/([\d.]*) Safari/)) && m[1]) {
                UA[shell = 'safari'] = numberify(m[1]);
            }

            // Apple Mobile
            if (/ Mobile\//.test(ua) && ua.match(/iPad|iPod|iPhone/)) {
                UA[MOBILE] = 'apple'; // iPad, iPhone or iPod Touch

                m = ua.match(/OS ([^\s]*)/);
                if (m && m[1]) {
                    m = numberify(m[1].replace('_', '.'));
                }
                UA.ios = m;
                os = 'ios';
                m = ua.match(/iPad|iPod|iPhone/);
                if (m && m[0]) {
                    UA[m[0].toLowerCase()] = UA.ios;
                }
            } else if (/ Android/.test(ua)) {
                if (/Mobile/.test(ua)) {
                    os = UA.mobile = 'android';
                }
                m = ua.match(/Android ([^\s]*);/);
                if (m && m[1]) {
                    UA.android = numberify(m[1]);
                }
            }
            // Other WebKit Mobile Browsers
            else if ((m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))) {
                UA[MOBILE] = m[0].toLowerCase(); // Nokia N-series, Android, webOS, ex: NokiaN95
            }

            if ((m = ua.match(/PhantomJS\/([^\s]*)/)) && m[1]) {
                UA.phantomjs = numberify(m[1]);
            }
        }
        // NOT WebKit
        else {
            // Presto
            // ref: http://www.useragentstring.com/pages/useragentstring.php
            if ((m = ua.match(/Presto\/([\d.]*)/)) && m[1]) {
                UA[core = 'presto'] = numberify(m[1]);

                // Opera
                if ((m = ua.match(/Opera\/([\d.]*)/)) && m[1]) {
                    UA[shell = 'opera'] = numberify(m[1]); // Opera detected, look for revision

                    if ((m = ua.match(/Opera\/.* Version\/([\d.]*)/)) && m[1]) {
                        UA[shell] = numberify(m[1]);
                    }

                    // Opera Mini
                    if ((m = ua.match(/Opera Mini[^;]*/)) && m) {
                        UA[MOBILE] = m[0].toLowerCase(); // ex: Opera Mini/2.0.4509/1316
                    }
                    // Opera Mobile
                    // ex: Opera/9.80 (Windows NT 6.1; Opera Mobi/49; U; en) Presto/2.4.18 Version/10.00
                    // issue: 由于 Opera Mobile 有 Version/ 字段，可能会与 Opera 混淆，同时对于 Opera Mobile 的版本号也比较混乱
                    else if ((m = ua.match(/Opera Mobi[^;]*/)) && m) {
                        UA[MOBILE] = m[0];
                    }
                }

                // NOT WebKit or Presto
            } else {
                // MSIE
                // 由于最开始已经使用了 IE 条件注释判断，因此落到这里的唯一可能性只有 IE10+
                if ((m = ua.match(/MSIE\s([^;]*)/)) && m[1]) {
                    UA[core = 'trident'] = 0.1; // Trident detected, look for revision
                    UA[shell = 'ie'] = numberify(m[1]);

                    // Get the Trident's accurate version
                    if ((m = ua.match(/Trident\/([\d.]*)/)) && m[1]) {
                        UA[core] = numberify(m[1]);
                    }

                    // NOT WebKit, Presto or IE
                } else {
                    // Gecko
                    if ((m = ua.match(/Gecko/))) {
                        UA[core = 'gecko'] = 0.1; // Gecko detected, look for revision
                        if ((m = ua.match(/rv:([\d.]*)/)) && m[1]) {
                            UA[core] = numberify(m[1]);
                        }

                        // Firefox
                        if ((m = ua.match(/Firefox\/([\d.]*)/)) && m[1]) {
                            UA[shell = 'firefox'] = numberify(m[1]);
                        }
                    }
                }
            }
        }
    }

    if (!os) {
        if ((/windows|win32/i).test(ua)) {
            os = 'windows';
        } else if ((/macintosh|mac_powerpc/i).test(ua)) {
            os = 'macintosh';
        } else if ((/linux/i).test(ua)) {
            os = 'linux';
        } else if ((/rhino/i).test(ua)) {
            os = 'rhino';
        }
    }

    UA.os = os;
    UA.core = core;
    UA.shell = shell;
    UA._numberify = numberify;
    return UA;
});

/*
 NOTES:
 2012.11.21 yiminghe@gmail.com
 - touch and os support

 2011.11.08
 - ie < 10 使用条件注释判断内核，更精确 by gonghaocn@gmail.com

 2010.03
 - jQuery, YUI 等类库都推荐用特性探测替代浏览器嗅探。特性探测的好处是能自动适应未来设备和未知设备，比如
 if(document.addEventListener) 假设 IE9 支持标准事件，则代码不用修改，就自适应了“未来浏览器”。
 对于未知浏览器也是如此。但是，这并不意味着浏览器嗅探就得彻底抛弃。当代码很明确就是针对已知特定浏览器的，
 同时并非是某个特性探测可以解决时，用浏览器嗅探反而能带来代码的简洁，同时也也不会有什么后患。总之，一切
 皆权衡。
 - UA.ie && UA.ie < 8 并不意味着浏览器就不是 IE8, 有可能是 IE8 的兼容模式。进一步的判断需要使用 documentMode.

 TODO:
 - test mobile
 - 3Q 大战后，360 去掉了 UA 信息中的 360 信息，需采用 res 方法去判断

 */
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
        if (S.trim(className)) {
            documentElement.className = S.trim(documentElement.className + className);
        }
    }
}, {
    requires: ['./base']
});

/*
 refer :
 - http://yiminghe.iteye.com/blog/444889
 *//**
 * @ignore
 * @fileOverview ua-extra
 * @author gonghao@ghsky.com
 */
KISSY.add('ua/extra', function (S, UA, undefined) {
    var win = S.Env.host,
        navigator = win.navigator,
        ua = navigator && navigator.userAgent || "",
        m, external, shell,
        o = {
            /**
             * 360 browser version
             * @type undefined|Number
             * @member KISSY.UA
             */
            se360: undefined,
            /**
             * maxthon version
             * @type undefined|Number
             * @member KISSY.UA
             */
            maxthon: undefined,
            /**
             * tencent browser version
             * @type undefined|Number
             * @member KISSY.UA
             */
            tt: undefined,
            /**
             * theworld version
             * @type undefined|Number
             * @member KISSY.UA
             */
            theworld: undefined,
            /**
             * sougou browser version
             * @type undefined|Number
             * @member KISSY.UA
             */
            sougou: undefined
        },
        numberify = UA._numberify;

    /*
     说明：
     @子涯总结的各国产浏览器的判断依据: http://spreadsheets0.google.com/ccc?key=tluod2VGe60_ceDrAaMrfMw&hl=zh_CN#gid=0
     根据 CNZZ 2009 年度浏览器占用率报告，优化了判断顺序：http://www.tanmi360.com/post/230.htm
     如果检测出浏览器，但是具体版本号未知用 0.1 作为标识
     世界之窗 & 360 浏览器，在 3.x 以下的版本都无法通过 UA 或者特性检测进行判断，所以目前只要检测到 UA 关键字就认为起版本号为 3
     */

    // 360Browser
    if (m = ua.match(/360SE/)) {
        o[shell = 'se360'] = 3; // issue: 360Browser 2.x cannot be recognised, so if recognised default set verstion number to 3
    }
    // Maxthon
    else if ((m = ua.match(/Maxthon/)) && (external = win.external)) {
        // issue: Maxthon 3.x in IE-Core cannot be recognised and it doesn't have exact version number
        // but other maxthon versions all have exact version number
        shell = 'maxthon';
        try {
            o[shell] = numberify(external['max_version']);
        } catch (ex) {
            o[shell] = 0.1;
        }
    }
    // TT
    else if (m = ua.match(/TencentTraveler\s([\d.]*)/)) {
        o[shell = 'tt'] = m[1] ? numberify(m[1]) : 0.1;
    }
    // TheWorld
    else if (m = ua.match(/TheWorld/)) {
        o[shell = 'theworld'] = 3; // issue: TheWorld 2.x cannot be recognised, so if recognised default set verstion number to 3
    }
    // Sougou
    else if (m = ua.match(/SE\s([\d.]*)/)) {
        o[shell = 'sougou'] = m[1] ? numberify(m[1]) : 0.1;
    }

    // If the browser has shell(no matter IE-core or Webkit-core or others), set the shell key
    shell && (o.shell = shell);

    S.mix(UA, o);
    return UA;
}, {
    requires: ['ua/base']
});
/**
 * @ignore
 * @fileOverview ua
 */
KISSY.add('ua', function (S, UA) {
    S.UA = UA;
    return UA;
}, {
    requires: ['ua/extra', 'ua/css']
});
