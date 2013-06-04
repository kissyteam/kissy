/**
 * @ignore
 * Default KISSY Gallery and core alias.
 * @author yiminghe@gmail.com
 */
(function (S) {
    var parentUri = S.Config.baseUri.resolve('../').toString();
    S.config({
        packages: {
            gallery: {
                base: parentUri
            },
            mobile: {
                base: parentUri
            }
        },
        modules: {
            core: {
                alias: ['dom', 'event', 'io', 'anim', 'base', 'node', 'json', 'cookie']
            }
        }
    });
})(KISSY);
