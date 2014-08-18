/**
 * @ignore
 * Default KISSY Gallery and core alias.
 * @author yiminghe@gmail.com
 */
(function (S) {
    // compatibility
    S.config({
        modules: {
            core: {
                alias: ['dom', 'event', 'io', 'anim', 'base', 'node', 'json', 'ua', 'cookie']
            },
            ajax: {
                alias: 'io'
            },
            'rich-base': {
                alias: 'base'
            }
        }
    });
    if (typeof location !== 'undefined') {
        var https = S.startsWith(location.href, 'https');
        var prefix = https ? 'https://s.tbcdn.cn/s/kissy/' : 'http://a.tbcdn.cn/s/kissy/';
        S.config({
            packages: {
                gallery: {
                    base: prefix
                },
                kg: {
                    base: '//g.alicdn.com/'
                },
                mobile: {
                    base: prefix
                }
            }
        });
    }
})(KISSY);
