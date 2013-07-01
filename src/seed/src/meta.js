/**
 * @ignore
 * Default KISSY Gallery and core alias.
 * @author yiminghe@gmail.com
 */
(function (S) {
    var https = S.startsWith(location.href, 'https');
    var prefix = https ? 'https://s.tbcdn.cn/kissy/' : 'http://a.tbcdn.cn/kissy/';
    S.config({
        packages: {
            gallery: {
                base: prefix + 'gallery/'
            },
            mobile: {
                base: prefix + 'mobile/'
            }
        },
        modules: {
            core: {
                alias: ['dom', 'event', 'ajax', 'anim', 'base', 'node', 'json', 'ua', 'cookie']
            }
        }
    });
})(KISSY);
