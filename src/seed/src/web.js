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

KISSY.config({
    packages: {
        gallery: {
            base: location.protocol === 'https' ?
                'https://s.tbcdn.cn/s/kissy/gallery' : 'http://a.tbcdn.cn/s/kissy/gallery'
        }
    }
});

KISSY.use('feature');