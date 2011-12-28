/**
 * @fileOverview map mechanism
 * @author yiminghe@gmail.com
 */
(function (S, loader) {
    if ("require" in this) {
        return;
    }
    /**
     * modify current module path
     * @private
     * @param rules
     * @example
     * <code>
     *      [
     *          [/(.+-)min(.js(\?t=\d+)?)$/,"$1$2"],
     *          [/(.+-)min(.js(\?t=\d+)?)$/,function(_,m1,m2){
     *              return m1+m2;
     *          }]
     *      ]
     * </code>
     */
    S.configs.map = function (rules) {
        S.Config.mappedRules = (S.Config.mappedRules || []).concat(rules);
    };

    S.mix(loader, {
        __getMappedPath:function (path) {
            var __mappedRules = S.Config.mappedRules || [];
            for (var i = 0; i < __mappedRules.length; i++) {
                var m, rule = __mappedRules[i];
                if (m = path.match(rule[0])) {
                    return path.replace(rule[0], rule[1]);
                }
            }
            return path;
        }
    });

})(KISSY, KISSY.__loader);