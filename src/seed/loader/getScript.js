/**
 * getScript support for css and js callback after load
 * @author: lifesinger@gmail.com,yiminghe@gmail.com
 */
(function(S, utils) {
    if ("require" in this) return;
    var scriptOnload = utils.scriptOnload,
        isWebKit = utils.isWebKit;
    S.mix(S, {
        //refer : http://lifesinger.org/lab/2011/load-js-css/css-preload.html
        //暂时不考虑如何判断失败，如 404 等
        getStyle:function(url, success, charset) {
            var doc = document,
                head = doc.getElementsByTagName("head")[0],
                node = doc.createElement('link'),
                config = success;

            if (S.isPlainObject(config)) {
                success = config.success;
                charset = config.charset;
            }

            node.href = url;
            node.rel = 'stylesheet';

            if (charset) {
                node.charset = charset;
            }

            if (success) {
                if (window.attachEvent) {
                    node.onload = function() {
                        node.onload = null;
                        S.log('ie/opera loaded : ' + url);
                        success.call(node);
                    };
                } else {
                    function poll() {
                        var loaded = false;
                        if (isWebKit) {
                            if (node['sheet']) {
                                S.log("webkit loaded : " + url);
                                loaded = true;
                            }
                        } else if (node['sheet']) {
                            try {
                                if (node['sheet'].cssRules) {
                                    S.log('firefox  ' + node['sheet'].cssRules + ' loaded : ' + url);
                                    loaded = true;
                                }
                            } catch(ex) {
                                S.log('firefox  ' + ex.name + ' ' + url);
                                if (ex.name === 'NS_ERROR_DOM_SECURITY_ERR') {
                                    S.log('firefox  ' + ex.name + ' loaded : ' + url);
                                    loaded = true;
                                }
                            }
                        }
                        if (!loaded) {
                            setTimeout(poll, 300);
                        } else {
                            success.call(node);
                        }
                    }

                    poll();
                }
            }
            head.appendChild(node);
            return node;

        },
        /**
         * Load a JavaScript file from the server using a GET HTTP request, then execute it.
         * <code>
         *  getScript(url, success, charset);
         *  or
         *  getScript(url, {
         *      charset: string
         *      success: fn,
         *      error: fn,
         *      timeout: number
         *  });
         * </code>
         */
        getScript:function(url, success, charset) {
            if (/\.css(?:\?|$)/i.test(url)) {
                return S.getStyle(url, success, charset);
            }
            var doc = document,
                head = doc.getElementsByTagName("head")[0],
                node = doc.createElement('script'),
                config = success,
                error,
                timeout,
                timer;

            if (S.isPlainObject(config)) {
                success = config.success;
                error = config.error;
                timeout = config.timeout;
                charset = config.charset;
            }

            function clearTimer() {
                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }
            }


            node.src = url;
            node.async = true;
            if (charset) {
                node.charset = charset;
            }
            if (success || error) {
                scriptOnload(node, function() {
                    clearTimer();
                    S.isFunction(success) && success.call(node);
                });

                if (S.isFunction(error)) {

                    //标准浏览器
                    if (doc.addEventListener) {
                        node.addEventListener("error", function() {
                            clearTimer();
                            error.call(node);
                        }, false);
                    }

                    timer = S.later(function() {
                        timer = undefined;
                        error();
                    }, (timeout || this.Config.timeout) * 1000);
                }
            }
            head.insertBefore(node, head.firstChild);
            return node;
        }
    });

})(KISSY, KISSY.__loaderUtils);