/**
 * @ignore
 * Declare config info for KISSY.
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {
    var Loader = S.Loader,
        Utils = Loader.Utils,
        host = S.Env.host,
        location = host.location,
        simulatedLocation,
        locationHref,
        configFns = S.Config.fns;

    if (!S.UA.nodejs && location && (locationHref = location.href)) {
        simulatedLocation = new S.Uri(locationHref)
    }

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

    configFns.packages = function (config) {
        var name,
            Config = this.Config,
            ps = Config.packages = Config.packages || {};
        if (config) {
            S.each(config, function (cfg, key) {
                // 兼容数组方式
                name = cfg.name || key;

                // 兼容 path
                var baseUri = normalizeBase(cfg.base || cfg.path);

                cfg.name = name;
                cfg.base = baseUri.toString();
                cfg.baseUri = baseUri;
                cfg.runtime = S;
                delete cfg.path;
                if (ps[name]) {
                    ps[name].reset(cfg);
                } else {
                    ps[name] = new Loader.Package(cfg);
                }
            });
            return undefined;
        } else if (config === false) {
            Config.packages = {
            };
            return undefined;
        } else {
            return ps;
        }
    };

    configFns.modules = function (modules) {
        var self = this,
            Env = self.Env;
        if (modules) {
            S.each(modules, function (modCfg, modName) {
                Utils.createModuleInfo(self, modName, modCfg);
                var modObj = Env.mods[modName];

                if(modObj && modObj.requires){
                    delete modCfg.requires;
                }

                S.mix(modObj, modCfg);
            });
        }
    };

    configFns.base = function (base) {
        var self = this,
            Config = self.Config,
            baseUri;
        if (!base) {
            return Config.base;
        }
        baseUri = normalizeBase(base);
        Config.base = baseUri.toString();
        Config.baseUri = baseUri;
        return undefined;
    };

    function normalizeBase(base) {
        var baseUri;
        base = base.replace(/\\/g, '/');
        if (base.charAt(base.length - 1) != '/') {
            base += '/';
        }
        if (simulatedLocation) {
            baseUri = simulatedLocation.resolve(base);
        } else {
            // add scheme for S.Uri
            // currently only for nodejs
            if (!S.startsWith(base, 'file:')) {
                base = 'file:' + base;
            }
            baseUri = new S.Uri(base);
        }
        return baseUri;
    }
})(KISSY);
