/**
 * @fileOverview package mechanism
 * @author yiminghe@gmail.com
 */
(function (S, loader, utils) {
    if (typeof require !== 'undefined') {
        return;
    }
    /**
     * 包声明
     * biz -> .
     * 表示遇到 biz/x
     * 在当前网页路径找 biz/x.js
     * @private
     */
    S.configs.packages = function (cfgs) {
        var ps = S.Config.packages = S.Config.packages || {};
        S.each(cfgs, function (cfg) {
            ps[cfg.name] = cfg;
            //注意正则化
            cfg.path = cfg.path && utils.normalBasePath(cfg.path);
            cfg.tag = cfg.tag && encodeURIComponent(cfg.tag);
        });
    };
})(KISSY, KISSY.__loader, KISSY.__loaderUtils);