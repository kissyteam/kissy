/**
 * @ignore
 * Default KISSY Gallery and core alias.
 * @author yiminghe@gmail.com
 */

KISSY.config({
    modules: {
        ajax: {
            alias: 'io'
        }
    }
});

var prefix = location.protocol === 'https' ?
    'https://s.tbcdn.cn/s/kissy/' : 'http://a.tbcdn.cn/s/kissy/';

KISSY.config({
    packages: {
        gallery: {
            base: prefix
        }
    }
});

KISSY.use('feature');