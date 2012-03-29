/**
 * @fileOverview getScript support for css and js callback after load
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
(function (S) {
    if (typeof require !== 'undefined') {
        return;
    }
    var MILLISECONDS_OF_SECOND = 1000,
        doc = S.Env.host.document,
        utils = S.Loader.Utils,
        jsCallbacks = {},
        cssCallbacks = {};

    S.mix(S, {

        /**
         * load  a css file from server using http get,
         * after css file load ,execute success callback.
         * note: no support for timeout and error
         * @param url css file url
         * @param success callback
         * @param charset
         * @private
         */
        getStyle:function (url, success, charset) {

            var config = success;

            if (S.isPlainObject(config)) {
                success = config.success;
                charset = config.charset;
            }
            var src = utils.absoluteFilePath(url),
                callbacks = cssCallbacks[src] = cssCallbacks[src] || [];

            callbacks.push(success);

            if (callbacks.length > 1) {
                // S.log(" queue css : " + callbacks.length);
                return callbacks.node;
            }

            var head = utils.docHead(),
                node = doc.createElement('link');

            callbacks.node = node;

            node.href = url;
            node.rel = 'stylesheet';

            if (charset) {
                node.charset = charset;
            }
            utils.styleOnLoad(node, function () {
                var callbacks = cssCallbacks[src];
                S.each(callbacks, function (callback) {
                    if (callback) {
                        callback.call(node);
                    }
                });
                delete cssCallbacks[src];
            });
            // css order matters!
            head.appendChild(node);
            return node;

        },
        /**
         * Load a JavaScript/Css file from the server using a GET HTTP request,
         * then execute it.
         * @example
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
         * @param {String} url resource's url
         * @param {Function|Object} [success] success callback or config
         * @param {Function} [success.success] success callback
         * @param {Function} [success.error] error callback
         * @param {Number} [success.timeout] timeout (s)
         * @param {String} [success.charset] charset of current resource
         * @param {String} [charset] charset of current resource
         * @returns {HTMLElement} script/style node
         * @memberOf KISSY
         */
        getScript:function (url, success, charset) {
            if (utils.isCss(url)) {
                return S.getStyle(url, success, charset);
            }

            var config = success,
                error,
                timeout,
                timer;

            if (S.isPlainObject(config)) {
                success = config.success;
                error = config.error;
                timeout = config.timeout;
                charset = config.charset;
            }

            var src = utils.absoluteFilePath(url),
                callbacks = jsCallbacks[src] = jsCallbacks[src] || [];

            callbacks.push([success, error]);

            if (callbacks.length > 1) {
                // S.log(" queue js : " + callbacks.length + " : for :" + url + " by " + (config.source || ""));
                return callbacks.node;
            } else {
                // S.log("init getScript : by " + config.source);
            }

            var head = utils.docHead(),
                node = doc.createElement('script'),
                clearTimer = function () {
                    if (timer) {
                        timer.cancel();
                        timer = undefined;
                    }
                };

            node.src = url;
            node.async = true;

            callbacks.node = node;

            if (charset) {
                node.charset = charset;
            }

            var end = function (error) {
                var index = error ? 1 : 0;
                clearTimer();
                var callbacks = jsCallbacks[src];
                S.each(callbacks, function (callback) {
                    if (callback[index]) {
                        callback[index].call(node);
                    }
                });
                delete jsCallbacks[src];
            }

            utils.scriptOnLoad(node, function () {
                end(0);
            });

            //标准浏览器
            if (node.addEventListener) {
                node.addEventListener("error", function () {
                    end(1);
                }, false);
            }

            if (timeout) {
                timer = S.later(function () {
                    end(1);
                }, timeout * MILLISECONDS_OF_SECOND);
            }
            head.insertBefore(node, head.firstChild);
            return node;
        }
    });

})(KISSY);
/**
 * yiminghe@gmail.com refactor@2012-03-29
 *  - 考虑连续重复请求单个 script 的情况，内部排队
 *
 * yiminghe@gmail.com 2012-03-13
 *  - getScript
 *      - 404 in ie<9 trigger success , others trigger error
 *      - syntax error in all trigger success
 **/