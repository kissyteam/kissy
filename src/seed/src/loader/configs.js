/**
 * @ignore
 * @fileOverview Declare config info for KISSY.
 * @author yiminghe@gmail.com
 */
(function (S) {

    var Loader = S.Loader,
        utils = Loader.Utils,
        configs = S.configs;
    /*
     modify current module path

     [
     [/(.+-)min(.js(\?t=\d+)?)$/, '$1$2'],
     [/(.+-)min(.js(\?t=\d+)?)$/, function(_,m1,m2){
     return m1+m2;
     }]
     ]

     */
    configs.map = function (rules) {
        var self = this;
        if (rules === false) {
            return self.Config.mappedRules = [];
        }
        return self.Config.mappedRules = (self.Config.mappedRules || []).concat(rules || []);
    };

    configs.mapCombo = function (rules) {
        var self = this;
        if (rules === false) {
            return self.Config.mappedComboRules = [];
        }
        return self.Config.mappedComboRules = (self.Config.mappedComboRules || []).concat(rules || []);
    };

    /*
     包声明
     biz -> .
     表示遇到 biz/x
     在当前网页路径找 biz/x.js
     @private
     */
    configs.packages = function (cfgs) {
        var self = this,
            name,
            base,
            Env = self.Env,
            ps = Env.packages = Env.packages || {};
        if (cfgs) {
            S.each(cfgs, function (cfg, key) {
                // 兼容数组方式
                name = cfg.name || key;
                // 兼容 path
                base = cfg.base || cfg.path;

                // nodejs must be absolute local file path
                if (S.Env.nodejs && !S.startsWith(base, 'file:')) {
                    // specify scheme for KISSY.Uri
                    base = 'file:' + base;
                }

                // must be folder
                if (!S.endsWith(base, '/')) {
                    base += '/';
                }

                // 注意正则化
                cfg.name = name;
                var baseUri = utils.resolveByPage(base);
                cfg.base = baseUri.toString();
                cfg.baseUri = baseUri;
                cfg.runtime = S;
                delete cfg.path;

                ps[ name ] = new Loader.Package(cfg);
            });
        } else if (cfgs === false) {
            Env.packages = {};
        }
    };

    /*
     只用来指定模块依赖信息.
     <code>

     KISSY.config({
     base: '',
     // dom-min.js
     debug: '',
     combine: true,
     tag: '',
     packages: {
     'biz1': {
     // path change to base
     base: 'haha',
     // x.js
     debug: '',
     tag: '',
     combine: false,
     }
     },
     modules: {
     'biz1/main': {
     requires: ['biz1/part1', 'biz1/part2']
     }
     }
     });
     */
    configs.modules = function (modules) {
        var self = this;
        if (modules) {
            S.each(modules, function (modCfg, modName) {
                utils.createModuleInfo(self, modName, modCfg);
                S.mix(self.Env.mods[modName], modCfg);
            });
        } else if (modules === false) {
            self.Env.mods = {};
        }
    };

    /*
     KISSY 's base path.
     */
    configs.base = function (base) {
        var self = this, baseUri, Config = self.Config;
        if (!base) {
            return Config.base;
        }
        // nodejs must be absolute local file path
        if (S.Env.nodejs && !S.startsWith(base, 'file:')) {
            // specify scheme for KISSY.Uri
            base = 'file:' + base;
        }
        baseUri = utils.resolveByPage(base);
        Config.base = baseUri.toString();
        Config.baseUri = baseUri;
    };
})(KISSY);