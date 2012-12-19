/**
 * @ignore
 * @fileOverview Declare config info for KISSY.
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {

    var Loader = S.Loader,
        utils = Loader.Utils,
        host = S.Env.host,
        location = host.location || { href: '' },
        simulatedLocation = new S.Uri(location.href),
        configFns = S.Config.fns;
    /*
     modify current module path

     [
     [/(.+-)min(.js(\?t=\d+)?)$/, '$1$2'],
     [/(.+-)min(.js(\?t=\d+)?)$/, function(_,m1,m2){
     return m1+m2;
     }]
     ]

     */
    configFns.map = function (rules) {
        var Config = this.Config;
        if (rules === false) {
            return Config.mappedRules = [];
        }
        return Config.mappedRules = (Config.mappedRules || []).concat(rules || []);
    };

    configFns.mapCombo = function (rules) {
        var Config = this.Config;
        if (rules === false) {
            return Config.mappedComboRules = [];
        }
        return Config.mappedComboRules = (Config.mappedComboRules || []).concat(rules || []);
    };

    /*
     包声明
     biz -> .
     表示遇到 biz/x
     在当前网页路径找 biz/x.js
     @private
     */
    configFns.packages = function (cfgs) {
        var name,
            base,
            baseUri,
            Config = this.Config,
            ps = Config.packages = Config.packages || {};
        if (cfgs) {
            S.each(cfgs, function (cfg, key) {
                // 兼容数组方式
                name = cfg.name || key;

                // 兼容 path
                base = normPathForNode(cfg.base || cfg.path);

                // must be folder
                if (!S.endsWith(base, '/')) {
                    base += '/';
                }
                // 注意正则化
                baseUri = simulatedLocation.resolve(base);
                cfg.name = name;
                cfg.base = baseUri.toString();
                cfg.baseUri = baseUri;
                cfg.runtime = S;
                delete cfg.path;
                ps[name] = new Loader.Package(cfg);
            });
            return undefined;
        } else if (cfgs === false) {
            Config.packages = {
            };
            return undefined;
        } else {
            return ps;
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
    configFns.modules = function (modules) {
        var self = this,
            Env = self.Env;
        if (modules) {
            S.each(modules, function (modCfg, modName) {
                utils.createModuleInfo(self, modName, modCfg);
                S.mix(Env.mods[modName], modCfg);
            });
        }
    };

    /*
     KISSY 's base path.
     */
    configFns.base = function (base) {
        var self = this,
            Config = self.Config, baseUri;
        if (!base) {
            return Config.base;
        }

        base = normPathForNode(base);

        baseUri = simulatedLocation.resolve(base);
        Config.base = baseUri.toString();
        Config.baseUri = baseUri;
        return undefined;
    };

    function normPathForNode(base) {
        // nodejs must be absolute local file path
        if (S.Env.nodejs && !S.startsWith(base, 'file:')) {
            // specify scheme for KISSY.Uri
            base = 'file:' + base;
        }
        return base;
    }
})(KISSY);