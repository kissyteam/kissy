/**
 * @ignore
 * @fileOverview Utils for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S) {

    if (S.Env.nodejs) {
        return;
    }

    var Loader = S.Loader,
        Path = S.Path,
        Uri = S.Uri,
        ua = navigator.userAgent,
        startsWith = S.startsWith,
        data = Loader.STATUS,
        /**
         * @class KISSY.Loader.Utils
         * Utils for KISSY Loader
         * @singleton
         * @private
         */
            Utils = {},
        host = S.Env.host,
        isWebKit = !!ua.match(/AppleWebKit/),
        doc = host.document,
        simulatedLocation = new Uri(location.href);


    // http://wiki.commonjs.org/wiki/Packages/Mappings/A
    // 如果模块名以 / 结尾，自动加 index
    function indexMap(s) {
        if (S.isArray(s)) {
            var ret = [], i = 0;
            for (; i < s.length; i++) {
                ret[i] = indexMapStr(s[i]);
            }
            return ret;
        }
        return indexMapStr(s);
    }

    function indexMapStr(s) {
        // 'x/' 'x/y/z/'
        if (S.endsWith(Path.basename(s), '/')) {
            s += 'index';
        }
        return s;
    }

    S.mix(Utils, {

        /**
         * get document head
         * @return {HTMLElement}
         */
        docHead: function () {
            return doc.getElementsByTagName('head')[0] || doc.documentElement;
        },

        /**
         * isWebkit
         */
        isWebKit: isWebKit,

        /**
         * isGecko
         */
        isGecko: !isWebKit && !!ua.match(/Gecko/),

        /**
         * isPresto
         */
        isPresto: !!ua.match(/Presto/),

        /**
         * IE
         */
        IE: !!ua.match(/MSIE/),

        /**
         * Get absolute path of dep module.similar to {@link KISSY.Path#resolve}
         * @param moduleName current module 's name
         * @param depName dep module 's name
         * @return {string|Array}
         */
        normalDepModuleName: function (moduleName, depName) {
            var i = 0;

            if (!depName) {
                return depName;
            }

            if (S.isArray(depName)) {
                for (; i < depName.length; i++) {
                    depName[i] = Utils.normalDepModuleName(moduleName, depName[i]);
                }
                return depName;
            }

            if (startsWith(depName, '../') || startsWith(depName, './')) {
                // x/y/z -> x/y/
                return Path.resolve(Path.dirname(moduleName), depName);
            }

            return Path.normalize(depName);
        },

        /**
         * remove ext name
         * @param path
         * @return {String}
         */
        removeExtname: function (path) {
            return path.replace(/(-min)?\.js$/i, '');
        },

        /**
         * resolve according to current page location.
         * @return {String}
         */
        resolveByPage: function (path) {
            return simulatedLocation.resolve(path);
        },

        /**
         * create modules info
         * @param self
         * @param modNames
         */
        createModulesInfo: function (self, modNames) {
            S.each(modNames, function (m) {
                Utils.createModuleInfo(self, m);
            });
        },

        /**
         * create single module info
         * @param self
         * @param modName
         * @param cfg
         * @return {KISSY.Loader.Module}
         */
        createModuleInfo: function (self, modName, cfg) {
            modName = indexMapStr(modName);

            var mods = self.Env.mods,
                mod = mods[modName];

            if (mod) {
                return mod;
            }

            // 防止 cfg 里有 tag，构建 fullpath 需要
            mods[modName] = mod = new Loader.Module(S.mix({
                name: modName,
                SS: self
            }, cfg));

            return mod;
        },

        /**
         * Whether modNames is attached.
         * @param self
         * @param modNames
         * @return {Boolean}
         */
        isAttached: function (self, modNames) {
            return isStatus(self, modNames, data.ATTACHED);
        },

        /**
         * Whether modNames is loaded.
         * @param self
         * @param modNames
         * @return {Boolean}
         */
        isLoaded: function (self, modNames) {
            return isStatus(self, modNames, data.LOADED);
        },

        /**
         * Get module values
         * @param self
         * @param modNames
         * @return {Array}
         */
        getModules: function (self, modNames) {
            var mods = [self], mod;

            S.each(modNames, function (modName) {
                mod = self.Env.mods[modName];
                if (!mod || mod.getType() != 'css') {
                    mods.push(self.require(modName));
                }
            });

            return mods;
        },

        /**
         * Attach specified mod.
         * @param self
         * @param mod
         */
        attachMod: function (self, mod) {
            if (mod.status != data.LOADED) {
                return;
            }

            var fn = mod.fn,
                requires,
                value;

            // 需要解开 index，相对路径，去除 tag，但是需要保留 alias，防止值不对应
            requires = mod.requires = Utils.normalizeModNamesWithAlias(self, mod.requires, mod.name);

            if (fn) {
                if (S.isFunction(fn)) {
                    // context is mod info
                    value = fn.apply(mod, Utils.getModules(self, requires));
                } else {
                    value = fn;
                }
                mod.value = value;
            }

            mod.status = data.ATTACHED;

            self.getLoader().fire('afterModAttached', {
                mod: mod
            });
        },

        /**
         * Get mod names as array.
         * @param modNames
         * @return {String[]}
         */
        getModNamesAsArray: function (modNames) {
            if (S.isString(modNames)) {
                modNames = modNames.replace(/\s+/g, '').split(',');
            }
            return modNames;
        },

        /**
         * Three effects:
         * 1. add index : / => /index
         * 2. unalias : core => dom,event,ua
         * 3. relative to absolute : ./x => y/x
         * @param {KISSY} self Global KISSY instance
         * @param {String|String[]} modNames Array of module names
         * or module names string separated by comma
         * @return {String[]}
         */
        normalizeModNames: function (self, modNames, refModName) {
            return Utils.unalias(self, Utils.normalizeModNamesWithAlias(self, modNames, refModName));
        },

        /**
         * unalias module name.
         * @param self
         * @param names
         * @return {Array}
         */
        unalias: function (self, names) {
            var ret = [].concat(names),
                i,
                m,
                alias,
                ok = 0,
                mods = self['Env'].mods;
            while (!ok) {
                ok = 1;
                for (i = ret.length - 1; i >= 0; i--) {
                    if ((m = mods[ret[i]]) && (alias = m.alias)) {
                        ok = 0;
                        ret.splice.apply(ret, [i, 1].concat(indexMap(alias)));
                    }
                }
            }
            return ret;
        },

        /**
         * normalize module names
         * @param self
         * @param modNames
         * @param [refModName]
         * @return {Array}
         */
        normalizeModNamesWithAlias: function (self, modNames, refModName) {
            var ret = [], i, l;
            if (modNames) {
                // 1. index map
                for (i = 0, l = modNames.length; i < l; i++) {
                    // conditional loader
                    // requires:[window.localStorage?"local-storage":""]
                    if (modNames[i]) {
                        ret.push(indexMap(modNames[i]));
                    }
                }
            }
            // 3. relative to absolute (optional)
            if (refModName) {
                ret = Utils.normalDepModuleName(refModName, ret);
            }
            return ret;
        },

        /**
         * register module with factory
         * @param self
         * @param name
         * @param fn
         * @param [config]
         */
        registerModule: function (self, name, fn, config) {
            var mods = self.Env.mods,
                mod = mods[name];

            if (mod && mod.fn) {
                S.log(name + ' is defined more than once');
                return;
            }

            // 没有 use，静态载入的 add 可能执行
            Utils.createModuleInfo(self, name);

            mod = mods[name];

            // 注意：通过 S.add(name[, fn[, config]]) 注册的代码，无论是页面中的代码，
            // 还是 js 文件里的代码，add 执行时，都意味着该模块已经 LOADED
            S.mix(mod, { name: name, status: data.LOADED });

            mod.fn = fn;

            S.mix((mods[name] = mod), config);

            S.log(name + ' is loaded');
        },

        /**
         * Get mapped path.
         * @param self
         * @param path
         * @return {String}
         */
        getMappedPath: function (self, path,rules) {
            var __mappedRules = rules||self.Config.mappedRules || [],
                i,
                m,
                rule;
            for (i = 0; i < __mappedRules.length; i++) {
                rule = __mappedRules[i];
                if (m = path.match(rule[0])) {
                    return path.replace(rule[0], rule[1]);
                }
            }
            return path;
        }
    });

    function isStatus(self, modNames, status) {
        var mods = self.Env.mods,
            i;
        modNames = S.makeArray(modNames);
        for (i = 0; i < modNames.length; i++) {
            var mod = mods[modNames[i]];
            if (!mod || mod.status !== status) {
                return false;
            }
        }
        return true;
    }

    Loader.Utils = Utils;

})(KISSY);