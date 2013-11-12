/**
 * @ignore
 * Utils for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S) {
    var Loader = S.Loader,
        Path = S.Path,
        host = S.Env.host,
        TRUE = !0,
        FALSE = !1,
        startsWith = S.startsWith,
        data = Loader.Status,
        ATTACHED = data.ATTACHED,
        LOADED = data.LOADED,
        ERROR = data.ERROR,
        /**
         * @class KISSY.Loader.Utils
         * Utils for KISSY Loader
         * @singleton
         * @private
         */
            Utils = Loader.Utils = {},
        doc = host.document;

    // http://wiki.commonjs.org/wiki/Packages/Mappings/A
    // 如果模块名以 / 结尾，自动加 index
    function indexMap(s) {
        if (typeof s == 'string') {
            return indexMapStr(s);
        } else {
            var ret = [],
                i = 0,
                l = s.length;
            for (; i < l; i++) {
                ret[i] = indexMapStr(s[i]);
            }
            return ret;
        }
    }

    function indexMapStr(s) {
        // 'x/' 'x/y/z/'
        if (s.charAt(s.length - 1) == '/') {
            s += 'index';
        }
        return s;
    }

    function pluginAlias(runtime, name) {
        var index = name.indexOf('!');
        if (index != -1) {
            var pluginName = name.substring(0, index);
            name = name.substring(index + 1);
            S.use(pluginName, {
                sync: true,
                success: function (S, Plugin) {
                    if (Plugin.alias) {
                        //noinspection JSReferencingMutableVariableFromClosure
                        name = Plugin.alias(runtime, name, pluginName);
                    }
                }
            });
        }
        return name;
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
         * Get absolute path of dep module.similar to {@link KISSY.Path#resolve}
         * @param {String} moduleName current module 's name
         * @param {String|String[]} depName dependency module 's name
         * @return {String|String[]} normalized dependency module 's name
         */
        normalDepModuleName: function (moduleName, depName) {
            var i = 0, l;

            if (!depName) {
                return depName;
            }

            if (typeof depName == 'string') {
                if (startsWith(depName, '../') || startsWith(depName, './')) {
                    // x/y/z -> x/y/
                    return Path.resolve(Path.dirname(moduleName), depName);
                }

                return Path.normalize(depName);
            }

            for (l = depName.length; i < l; i++) {
                depName[i] = Utils.normalDepModuleName(moduleName, depName[i]);
            }
            return depName;
        },

        /**
         * create modules info
         * @param runtime Module container, such as KISSY
         * @param {String[]} modNames to be created module names
         */
        createModulesInfo: function (runtime, modNames) {
            S.each(modNames, function (m) {
                Utils.createModuleInfo(runtime, m);
            });
        },

        /**
         * create single module info
         * @param runtime Module container, such as KISSY
         * @param {String} modName to be created module name
         * @param {Object} [cfg] module config
         * @return {KISSY.Loader.Module}
         */
        createModuleInfo: function (runtime, modName, cfg) {
            modName = indexMapStr(modName);

            var mods = runtime.Env.mods,
                module = mods[modName];

            if (module) {
                return module;
            }

            // 防止 cfg 里有 tag，构建 fullpath 需要
            mods[modName] = module = new Loader.Module(S.mix({
                name: modName,
                runtime: runtime
            }, cfg));

            return module;
        },

        /**
         * Whether modNames is attached.
         * @param runtime Module container, such as KISSY
         * @param modNames
         * @return {Boolean}
         */
        'isAttached': function (runtime, modNames) {
            return isStatus(runtime, modNames, ATTACHED);
        },

        /**
         * Get modules exports
         * @param runtime Module container, such as KISSY
         * @param {String[]} modNames module names
         * @return {Array} modules exports
         */
        getModules: function (runtime, modNames) {
            var mods = [runtime], module,
                unalias,
                allOk,
                m,
                runtimeMods = runtime.Env.mods;

            S.each(modNames, function (modName) {
                module = runtimeMods[modName];
                if (!module || module.getType() != 'css') {
                    unalias = Utils.unalias(runtime, modName);
                    allOk = S.reduce(unalias, function (a, n) {
                        m = runtimeMods[n];
                        return a && m && m.status == ATTACHED;
                    }, true);
                    if (allOk) {
                        mods.push(runtimeMods[unalias[0]].exports);
                    } else {
                        mods.push(null);
                    }
                } else {
                    mods.push(undefined);
                }
            });

            return mods;
        },

        /**
         * attach modules and their dependency modules recursively
         * @param {String[]} modNames module names
         * @param runtime Module container, such as KISSY
         * @param {String[]} [stack] stack for detecting circular dependency
         * @param {Array} [errorList] errors when attach mods
         * @param {Object} [cache] cached modules to avoid duplicate check
         * @returns {Boolean} whether success attach all modules
         */
        attachModsRecursively: function (modNames, runtime, stack, errorList, cache) {
            // for debug. prevent circular dependency
            stack = stack || [];
            // for efficiency. avoid duplicate non-attach check
            cache = cache || {};
            var i,
                s = 1,
                l = modNames.length,
                stackDepth = stack.length;
            for (i = 0; i < l; i++) {
                s = s && Utils.attachModRecursively(modNames[i], runtime, stack, errorList, cache);
                stack.length = stackDepth;
            }
            return !!s;
        },

        /**
         * attach module and its dependency modules recursively
         * @param {String} modName module name
         * @param runtime Module container, such as KISSY
         * @param {String[]} [stack] stack for detecting circular dependency
         * @param {Array} [errorList] errors when attach mods
         * @param {Object} [cache] cached modules to avoid duplicate check
         * @returns {Boolean} whether success attach all modules
         */
        attachModRecursively: function (modName, runtime, stack, errorList, cache) {
            var mods = runtime.Env.mods,
                status,
                m = mods[modName];
            if (modName in cache) {
                return cache[modName];
            }
            if (!m) {
                return cache[modName] = FALSE;
            }
            status = m.status;
            if (status == ATTACHED) {
                return cache[modName] = TRUE;
            }
            if (status == ERROR) {
                errorList.push(m);
            }
            if (status != LOADED) {
                return cache[modName] = FALSE;
            }
            if ('@DEBUG@') {
                if (S.inArray(modName, stack)) {
                    stack.push(modName);
                    S.error('find cyclic dependency between mods: ' + stack);
                    return cache[modName] = FALSE;
                }
                stack.push(modName);
            }
            if (Utils.attachModsRecursively(m.getNormalizedRequires(),
                runtime, stack, errorList, cache)) {
                Utils.attachMod(runtime, m);
                return cache[modName] = TRUE;
            }
            return cache[modName] = FALSE;
        },

        /**
         * Attach specified module.
         * @param runtime Module container, such as KISSY
         * @param {KISSY.Loader.Module} module module instance
         */
        attachMod: function (runtime, module) {
            if (module.status != LOADED) {
                return;
            }

            var fn = module.fn,
                exports = undefined;

            if (typeof fn === 'function') {
                // 需要解开 index，相对路径
                // 但是需要保留 alias，防止值不对应
                //noinspection JSUnresolvedFunction
                exports = fn.apply(module, Utils.getModules(runtime, module.getRequiresWithAlias()));
                if (exports !== undefined) {
                    //noinspection JSUndefinedPropertyAssignment
                    module.exports = exports;
                }
            } else {
                //noinspection JSUndefinedPropertyAssignment
                module.exports = fn;
            }

            module.status = ATTACHED;
        },

        /**
         * Get module names as array.
         * @param {String|String[]} modNames module names array or  module names string separated by ','
         * @return {String[]}
         */
        getModNamesAsArray: function (modNames) {
            if (typeof modNames == 'string') {
                modNames = modNames.replace(/\s+/g, '').split(',');
            }
            return modNames;
        },

        /**
         * normalize module names
         * 1. add index : / => /index
         * 2. unalias : core => dom,event,ua
         * 3. relative to absolute : ./x => y/x
         * @param {KISSY} runtime Global KISSY instance
         * @param {String|String[]} modNames Array of module names
         *  or module names string separated by comma
         * @param {String} [refModName]
         * @return {String[]} normalized module names
         */
        normalizeModNames: function (runtime, modNames, refModName) {
            return Utils.unalias(runtime,
                Utils.normalizeModNamesWithAlias(runtime, modNames, refModName));
        },

        /**
         * unalias module name.
         * @param runtime Module container, such as KISSY
         * @param {String|String[]} names moduleNames
         * @return {String[]} unalias module names
         */
        unalias: function (runtime, names) {
            var ret = [].concat(names),
                i,
                m,
                alias,
                ok = 0,
                j,
                mods = runtime['Env'].mods;
            while (!ok) {
                ok = 1;
                for (i = ret.length - 1; i >= 0; i--) {
                    if ((m = mods[ret[i]]) && (alias = m.alias)) {
                        ok = 0;
                        for (j = alias.length - 1; j >= 0; j--) {
                            if (!alias[j]) {
                                alias.splice(j, 1);
                            }
                        }
                        ret.splice.apply(ret, [i, 1].concat(indexMap(alias)));
                    }
                }
            }
            return ret;
        },

        /**
         * normalize module names with alias
         * @param runtime Module container, such as KISSY
         * @param {String[]} modNames module names
         * @param [refModName] module to be referred if module name path is relative
         * @return {String[]} normalize module names with alias
         */
        normalizeModNamesWithAlias: function (runtime, modNames, refModName) {
            var ret = [], i, l;
            if (modNames) {
                // 1. index map
                for (i = 0, l = modNames.length; i < l; i++) {
                    // conditional loader
                    // requires:[window.localStorage?"local-storage":""]
                    if (modNames[i]) {
                        ret.push(pluginAlias(runtime, indexMap(modNames[i])));
                    }
                }
            }
            // 2. relative to absolute (optional)
            if (refModName) {
                ret = Utils.normalDepModuleName(refModName, ret);
            }
            return ret;
        },

        /**
         * register module with factory
         * @param runtime Module container, such as KISSY
         * @param {String} name module name
         * @param {Function|*} fn module's factory or exports
         * @param [config] module config, such as dependency
         */
        registerModule: function (runtime, name, fn, config) {
            name = indexMapStr(name);

            var mods = runtime.Env.mods,
                module = mods[name];

            if (module && module.fn) {
                S.log(name + ' is defined more than once', 'warn');
                return;
            }

            // 没有 use，静态载入的 add 可能执行
            Utils.createModuleInfo(runtime, name);

            module = mods[name];

            // 注意：通过 S.add(name[, fn[, config]]) 注册的代码，无论是页面中的代码，
            // 还是 js 文件里的代码，add 执行时，都意味着该模块已经 LOADED
            S.mix(module, {
                name: name,
                status: LOADED,
                fn: fn
            });

            S.mix(module, config);
        },

        /**
         * Get mapped path.
         * @param runtime Module container, such as KISSY
         * @param {String} path module path
         * @param [rules] map rules
         * @return {String} mapped path
         */
        getMappedPath: function (runtime, path, rules) {
            var mappedRules = rules ||
                    runtime.Config.mappedRules ||
                    [],
                i,
                m,
                rule;
            for (i = 0; i < mappedRules.length; i++) {
                rule = mappedRules[i];
                if (m = path.match(rule[0])) {
                    return path.replace(rule[0], rule[1]);
                }
            }
            return path;
        },

        /**
         * Returns hash code of a string djb2 algorithm
         * @param {String} str
         * @returns {String} hash code
         */
        getHash: function (str) {
            var hash = 5381,
                i;
            for (i = str.length; --i > -1;) {
                hash = ((hash << 5) + hash) + str.charCodeAt(i);
                /* hash * 33 + char */
            }
            return hash + '';
        }
    });

    function isStatus(runtime, modNames, status) {
        var mods = runtime.Env.mods,
            module,
            i;
        modNames = S.makeArray(modNames);
        for (i = 0; i < modNames.length; i++) {
            module = mods[modNames[i]];
            if (!module || module.status !== status) {
                return 0;
            }
        }
        return 1;
    }
})(KISSY);