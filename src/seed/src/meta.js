/**
 * @ignore
 * Default KISSY Gallery and core alias.
 * @author yiminghe@gmail.com
 */
(function (S) {
    S.config({
        packages: {
            gallery: {
                base: S.Config.baseUri.resolve('../').toString()
            }
        },
        modules: {
            core: {
                alias: ['dom', 'event', 'ajax', 'anim', 'base', 'node', 'json','ua']
            }
        }
    });
})(KISSY);
