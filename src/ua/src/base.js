/**
 * @ignore
 * @fileOverview ua
 * @author lifesinger@gmail.com
 */
KISSY.add('ua/base', function (S, undefined) {

    var win = S.Env.host,
        doc = win.document,
        navigator = win.navigator,
        ua = navigator && navigator.userAgent || "",
        EMPTY = '',
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
             * mobile browser
             * @type String
             * @member KISSY.UA
             */
            mobile: undefined,
            /**
             * browser core name
             * @type String
             * @member KISSY.UA
             */
            core: undefined,
            /**
             * browser shell name
             * @type String
             * @member KISSY.UA
             */
            shell: undefined
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
            if (/ Mobile\//.test(ua)) {
                UA[MOBILE] = 'apple'; // iPad, iPhone or iPod Touch
            }
            // Other WebKit Mobile Browsers
            else if ((m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))) {
                UA[MOBILE] = m[0].toLowerCase(); // Nokia N-series, Android, webOS, ex: NokiaN95
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

    UA.core = core;
    UA.shell = shell;
    UA._numberify = numberify;
    return UA;
});

/*
 NOTES:

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
