/**
 * script/css load across browser
 * @author: yiminghe@gmail.com
 */
(function(S, utils) {
    if (S.use) return;
    var isWebKit = utils.isWebKit,
        /**
         * central poll for link node
         */
            timer = null,

        monitors = {
        /**
         * node.href:{node:node,callback:callback}
         */
        };

    function startCssTimer() {
        if (!timer) {
            S.log("start css polling");
            ccsPoll();
        }
    }

    // single thread is ok
    function ccsPoll() {
        var stop = true;
        for (var url in monitors) {
            var d = monitors[url],
                node = d.node,
                callback = d.callback,
                loaded = false;
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

            if (loaded) {
                callback.call(node);
                delete monitors[url];
            } else {
                stop = false;
            }
        }
        if (stop) {
            timer = null;
            S.log("end css polling");
        } else {
            timer = setTimeout(ccsPoll, 100);
        }
    }


    S.mix(utils, {
        scriptOnload:document.addEventListener ?
            function(node, callback) {
                if (utils.isLinkNode(node)) {
                    return utils.styleOnload(node, callback);
                }
                node.addEventListener('load', callback, false);
            } :
            function(node, callback) {
                if (utils.isLinkNode(node)) {
                    return utils.styleOnload(node, callback);
                }
                var oldCallback = node.onreadystatechange;
                node.onreadystatechange = function() {
                    var rs = node.readyState;
                    if (/loaded|complete/i.test(rs)) {
                        node.onreadystatechange = null;
                        oldCallback && oldCallback();
                        callback.call(this);
                    }
                };
            },

        /**
         * monitor css onload across browsers
         */
        styleOnload:window.attachEvent ?
            //ie/opera
            function(node, callback) {
                // whether to detach using function wrapper?
                function t() {
                    node.detachEvent('onload', t);
                    S.log('ie/opera loaded : ' + node.href);
                    callback.call(node);
                }

                node.attachEvent('onload', t);
            } :
            //refer : http://lifesinger.org/lab/2011/load-js-css/css-preload.html
            //暂时不考虑如何判断失败，如 404 等
            function(node, callback) {
                monitors[node.href] = {
                    node:node,
                    callback:callback
                };
                startCssTimer();
            }
    });

}

    )
    (KISSY, KISSY.__loaderUtils);