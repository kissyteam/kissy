/**
 * @fileOverview package mechanism
 * @author yiminghe@gmail.com
 */
(function (S, loader, utils) {
    if ("require" in this) {
        return;
    }
    /**
     * 包声明
     * biz -> .
     * 表示遇到 biz/x
     * 在当前网页路径找 biz/x.js
     */
    S.configs.packages = function (cfgs) {
        var ps;
        ps = S.Config.packages = S.Config.packages || {};
        S.each(cfgs, function (cfg) {
            ps[cfg.name] = cfg;
            //注意正则化
            cfg.path = cfg.path && utils.normalBasePath(cfg.path);
            cfg.tag = cfg.tag && encodeURIComponent(cfg.tag);
        });
    };
    S.mix(loader, {
        __getPackagePath:function (mod) {
            //缓存包路径，未申明的包的模块都到核心模块中找
            if (mod.packagepath) {
                return mod.packagepath;
            }
            var self = this,
                //一个模块合并到了另一个模块文件中去
                modName = mod.name,
                packages = self.Config.packages || {},
                pName = "",
                p_def;

            for (var p in packages) {
                if (packages.hasOwnProperty(p)) {
                    if (S.startsWith(modName, p) &&
                        p.length > pName) {
                        pName = p;
                    }
                }
            }
            p_def = packages[pName];
            mod.charset = p_def && p_def.charset || mod.charset;
            if (p_def) {
                mod.tag = p_def.tag;
            } else {
                // kissy 自身组件的事件戳后缀
                mod.tag = encodeURIComponent(S.Config.tag || S.buildTime);
            }
            return mod.packagepath = (p_def && p_def.path) || self.Config.base;
        }
    });
})(KISSY, KISSY.__loader, KISSY.__loaderUtils);