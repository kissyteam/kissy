/**
 * @ignore
 * Default KISSY Gallery and core alias.
 * @author yiminghe@gmail.com
 */
(function (S) {
    // compatibility
    S.config({
        modules: {
            ajax: {
                alias: 'io'
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
                mobile: {
                    base: prefix
                }
            }
        });
    }

    S.use('ua,feature,util', {sync: true});
})(KISSY);
