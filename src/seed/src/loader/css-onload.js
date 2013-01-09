/**
 * @ignore
 * script/css load across browser
 * @author yiminghe@gmail.com
 */
(function (S) {

    var CSS_POLL_INTERVAL = 30,
        UA= S.UA,
        utils = S.Loader.Utils,
    // central poll for link node
        timer = 0,
        monitors = {
            // node.id:{callback:callback,node:node}
        };


    /**
     * @ignore
     * References:
     *  - http://unixpapa.com/js/dyna.html
     *  - http://www.blaze.io/technical/ies-premature-execution-problem/
     *
     * `onload` event is supported in WebKit since 535.23
     *  - https://bugs.webkit.org/show_activity.cgi?id=38995
     * `onload/onerror` event is supported since Firefox 9.0
     *  - https://bugzilla.mozilla.org/show_bug.cgi?id=185236
     *  - https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
     *
     * monitor css onload across browsers.issue about 404 failure.
     *
     *  - firefox not ok（4 is wrong）：
     *    - http://yearofmoo.com/2011/03/cross-browser-stylesheet-preloading/
     *  - all is ok
     *    - http://lifesinger.org/lab/2011/load-js-css/css-preload.html
     *  - others
     *    - http://www.zachleat.com/web/load-css-dynamically/
     */

    function startCssTimer() {
        if (!timer) {
            // S.log('start css polling');
            cssPoll();
        }
    }

    // single thread is ok
    function cssPoll() {

        for (var url in monitors) {

            var callbackObj = monitors[url],
                node = callbackObj.node,
                exName,
                loaded = 0;
            if (UA.webkit) {
                // http://www.w3.org/TR/DOM-Level-2-Style/stylesheets.html
                if (node['sheet']) {
                    S.log('webkit loaded : ' + url);
                    loaded = 1;
                }
            } else if (node['sheet']) {
                try {
                    var cssRules = node['sheet'].cssRules;
                    if (cssRules) {
                        S.log('same domain firefox loaded : ' + url);
                        loaded = 1;
                    }
                } catch (ex) {
                    exName = ex.name;
                    S.log('firefox getStyle : ' + exName + ' ' + ex.code + ' ' + url);
                    // http://www.w3.org/TR/dom/#dom-domexception-code
                    if (// exName == 'SecurityError' ||
                    // for old firefox
                        exName == 'NS_ERROR_DOM_SECURITY_ERR') {
                        S.log(exName + ' firefox loaded : ' + url);
                        loaded = 1;
                    }
                }
            }

            if (loaded) {
                if (callbackObj.callback) {
                    callbackObj.callback.call(node);
                }
                delete monitors[url];
            }

        }

        if (S.isEmptyObject(monitors)) {
            timer = 0;
            // S.log('end css polling');
        } else {
            timer = setTimeout(cssPoll, CSS_POLL_INTERVAL);
        }
    }

    S.mix(utils, {
        pollCss: // refer : http://lifesinger.org/lab/2011/load-js-css/css-preload.html
        // 暂时不考虑如何判断失败，如 404 等
            function (node, callback) {
                var href = node.href,
                    arr;
                arr = monitors[href] = {};
                arr.node = node;
                arr.callback = callback;
                startCssTimer();
            }

    });
})(KISSY);