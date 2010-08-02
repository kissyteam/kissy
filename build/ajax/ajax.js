/*
Copyright 2010, KISSY UI Library v1.1.0
MIT Licensed
build time: Aug 2 23:09
*/
/**
 * @module  ajax
 * @author  lifesinger@gmail.com
 */
KISSY.add('ajax', function(S) {

    var doc = document,
        testNode = doc.createElement('script'),

        // try branching
        fn = testNode.readyState ? function(node, callback) {
            node.onreadystatechange = function() {
                var rs = node.readyState;
                if (rs === 'loaded' || rs === 'complete') {
                    // handle memory leak in IE
                    node.onreadystatechange = null;
                    callback.call(this);
                }
            };
        } : function(node, callback) {
            node.onload = callback;
        };

    S.mix(S, {
        /**
         * Load a JavaScript file from the server using a GET HTTP request, then execute it.
         */
        getScript: function(url, callback, charset) {
            var head = S.get('head') || doc.documentElement,
                node = doc.createElement('script');

            node.src = url;
            if (charset) node.charset = charset;
            node.async = true;

            if (S.isFunction(callback)) {
                fn(node, callback);
            }

            head.appendChild(node);
        }
    });
});

/**
 * NOTES:
 *  2010.04
 *   - api 考虑：jQuery 的全耦合在 jQuery 对象上，ajaxComplete 等方法不优雅。
 *         YUI2 的 YAHOO.util.Connect.Get.script 层级太深，YUI3 的 io 则
 *         野心过大，KISSY 借鉴 ExtJS, 部分方法借鉴 jQuery.
 */
