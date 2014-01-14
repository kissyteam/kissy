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
        simulatedLocation = new S.Uri(locationHref);
    }

    S.Config.loadModsFn = function (rs, config) {
        S.getScript(rs.path, config);
    };

    var PACKAGE_MEMBERS = ['alias', 'debug', 'tag', 'group', 'combine', 'charset'];
    configFns.packages = function (config) {
        var name,
            Config = this.Config,
            ps = Config.packages = Config.packages || {};
        if (config) {
            S.each(config, function (cfg, key) {
                // 兼容数组方式
                name = cfg.name || key;
                var path = cfg.base || cfg.path;
                var newConfig = {
                    runtime: S,
                    name: name
                };
                S.each(PACKAGE_MEMBERS, function (m) {
                    if (m in cfg) {
                        newConfig[m] = cfg[m];
                    }
                });
                if (path) {
                    path += '/';
                    if (!cfg.ignorePackageNameInUri) {
                        path += name + '/';
                    }
                    newConfig.uri = normalizePath(path, true);
                }
                if (ps[name]) {
                    ps[name].reset(newConfig);
                } else {
                    ps[name] = new Loader.Package(newConfig);
                }
            });
            return undefined;
        } else if (config === false) {
            Config.packages = {};
            return undefined;
        } else {
            return ps;
        }
    };

    configFns.modules = function (modules) {
        var self = this;
        if (modules) {
            S.each(modules, function (modCfg, modName) {
                var path = modCfg.path;
                if (path) {
                    modCfg.uri = normalizePath(path);
                    delete modCfg.path;
                }
                var mod = Utils.createModuleInfo(self, modName, modCfg);
                // #485, invalid after add
                if (mod.status === Loader.Status.INIT) {
                    S.mix(mod, modCfg);
                }
            });
        }
    };

    configFns.base = function (base) {
        var self = this,
            Config = self.Config,
            baseUri;
        if (!base) {
            return Config.baseUri.toString();
        }
        baseUri = normalizePath(base, true);
        Config.baseUri = baseUri;
        return undefined;
    };

    function normalizePath(base, isDirectory) {
        var baseUri;
        base = base.replace(/\\/g, '/');
        if (isDirectory && base.charAt(base.length - 1) !== '/') {
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
