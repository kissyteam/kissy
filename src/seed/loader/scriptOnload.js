/**
 * script load across browser
 * @author:yiminghe@gmail.com
 */
(function(S, utils) {
    if (S.use) return;
    utils.scriptOnload = document.addEventListener ?
        function(node, callback) {
            node.addEventListener('load', callback, false);
        } :
        function(node, callback) {
            var oldCallback = node.onreadystatechange;
            node.onreadystatechange = function() {
                var rs = node.readyState;
                if (rs === 'loaded' || rs === 'complete') {
                    node.onreadystatechange = null;
                    oldCallback && oldCallback();
                    callback.call(this);
                }
            };
        };

})(KISSY, KISSY.__loaderUtils);