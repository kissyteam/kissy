/**
 * @ignore
 * Default KISSY Gallery and core alias.
 * @author yiminghe@gmail.com
 */
(function (S) {
    S.config({
        modules: {
            core: {
                alias: ['dom', 'event', 'ajax', 'anim', 'base', 'node', 'json', 'ua', 'cookie']
            }
        }
    });
    if (typeof location != 'undefined') {
        var https = S.startsWith(location.href, 'https');
        var prefix = https ? 'https://s.tbcdn.cn/s/kissy/' : 'http://a.tbcdn.cn/s/kissy/';
        S.config({
            packages: {
                gallery: {
                    base: prefix
                },
                mobile: {
                    base: prefix
                }
            }
        });
    }
})(KISSY);
