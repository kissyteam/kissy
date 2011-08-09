/**
 * package mechanism
 * @author yiminghe@gmail.com
 */
(function(S, loader, utils) {
    if ("require" in this) {
        return;
    }
    var win = S.__HOST,
        doc = win['document'],
        head = doc.getElementsByTagName('head')[0] || doc.documentElement;

    S.mix(loader, {

            /**
             * 包声明
             * biz -> .
             * 表示遇到 biz/x
             * 在当前网页路径找 biz/x.js
             */
            _packages:function(cfgs) {
                var self = this,
                    ps;
                ps = self.__packages = self.__packages || {};
                S.each(cfgs, function(cfg) {
                    ps[cfg.name] = cfg;
                    //注意正则化
                    cfg.path = cfg.path && utils.normalBasePath(cfg.path);
                    cfg.tag = cfg.tag && encodeURIComponent(cfg.tag);
                });
            },

            __getPackagePath:function(mod) {
                //缓存包路径，未申明的包的模块都到核心模块中找
                if (mod.packagepath) {
                    return mod.packagepath;
                }
                var self = this,
                    //一个模块合并到了另一个模块文件中去
                    modName = self._combine(mod.name),
                    packages = self.__packages || {},
                    pName = "",
                    p_def,
                    p_path;

                for (var p in packages) {
                    if (packages.hasOwnProperty(p)
                        && S.startsWith(modName, p)
                        && p.length > pName
                        ) {
                        pName = p;
                    }
                }
                p_def = packages[pName];
                p_path = (p_def && p_def.path) || self.Config.base;
                mod.charset = p_def && p_def.charset;
                if (p_def) {
                    mod.tag = p_def.tag;
                } else {
                    // kissy 自身组件的事件戳后缀
                    mod.tag = encodeURIComponent(S.Config.tag || S.buildTime);
                }
                mod.packagepath = p_path;
                return p_path;
            },
            /**
             * compress 'from module' to 'to module'
             * {
             *   core:['dom','ua','event','node','json','ajax','anim','base','cookie']
             * }
             */
            _combine:function(from, to) {
                var self = this,
                    cs;
                if (S.isObject(from)) {
                    S.each(from, function(v, k) {
                        S.each(v, function(v2) {
                            self._combine(v2, k);
                        });
                    });
                    return;
                }
                cs = self.__combines = self.__combines || {};
                if (to) {
                    cs[from] = to;
                } else {
                    return cs[from] || from;
                }
            }
        });
})(KISSY, KISSY.__loader, KISSY.__loaderUtils);