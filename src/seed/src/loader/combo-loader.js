/**
 * combo loader for KISSY. using combo to load module files.
 * @ignore
 * @author yiminghe@gmail.com
 */
(function (S) {

    function loadScripts(rss, callback, charset) {
        var count = rss && rss.length,
            errorList = [],
            successList = [];

        function complete() {
            if (!(--count)) {
                callback(successList, errorList);
            }
        }

        S.each(rss, function (rs) {
            S.getScript(rs.fullpath, {
                success: function () {
                    successList.push(rs);
                    complete();
                },
                error: function () {
                    errorList.push(rs);
                    complete();
                },
                charset: charset
            });
        });
    }

    var Loader = S.Loader,
        Status = Loader.Status,
        Utils = Loader.Utils,
        LOADING = Status.LOADING,
        LOADED = Status.LOADED,
        ERROR = Status.ERROR,
        ATTACHED = Status.ATTACHED;

    /**
     * @class KISSY.Loader.ComboLoader
     * using combo to load module files
     * @param runtime KISSY
     * @param waitingModules
     * @private
     */
    function ComboLoader(runtime, waitingModules) {
        S.mix(this, {
            runtime: runtime,
            waitingModules: waitingModules
        });
    }

    function debugRemoteModules(rss) {
        S.each(rss, function (rs) {
            var ms = [];
            S.each(rs.mods, function (m) {
                if (m.status == LOADED) {
                    ms.push(m.name);
                }
            });
            if (ms.length) {
                S.log('load remote modules: "' + ms.join(', ') + '" from: "' + rs.fullpath + '"');
            }
        });
    }

    // ----------------------- private end
    S.augment(ComboLoader, {

        /**
         * use, _forceSync for kissy.js, initialize dom,event sync
         */
        use: function (normalizedModNames) {
            var self = this,
                allModNames,
                comboUrls,
                runtime = self.runtime;

            allModNames = S.keys(self.calculate(normalizedModNames));

            Utils.createModulesInfo(runtime, allModNames);

            comboUrls = self.getComboUrls(allModNames);

            // load css first to avoid page blink
            S.each(comboUrls.css, function (cssOne) {
                loadScripts(cssOne, function (success, error) {

                    if ('@DEBUG@') {
                        debugRemoteModules(success);
                    }

                    S.each(success, function (one) {
                        S.each(one.mods, function (mod) {
                            Utils.registerModule(runtime, mod.getName(), S.noop);
                            // notify all loader instance
                            mod.notifyAll();
                        });
                    });

                    S.each(error, function (one) {
                        S.each(one.mods, function (mod) {
                            var msg = mod.name +
                                ' is not loaded! can not find module in path : ' +
                                one.fullpath;
                            S.log(msg, 'error');
                            mod.status = ERROR;
                            // notify all loader instance
                            mod.notifyAll();
                        });
                    });

                }, cssOne.charset);
            });

            // jss css download in parallel
            S.each(comboUrls.js, function (jsOne) {
                loadScripts(jsOne, function (success) {

                    if ('@DEBUG@') {
                        debugRemoteModules(success);
                    }

                    S.each(jsOne, function (one) {
                        S.each(one.mods, function (mod) {
                            // fix #111
                            // https://github.com/kissyteam/kissy/issues/111
                            if (!mod.fn) {
                                var msg = mod.name +
                                    ' is not loaded! can not find module in path : ' +
                                    one.fullpath;
                                S.log(msg, 'error');
                                mod.status = ERROR;
                            }
                            // notify all loader instance
                            mod.notifyAll();
                        });
                    });

                }, jsOne.charset);
            });
        },

        /**
         * calculate dependency
         * @param modNames
         * @param [cache]
         * @param ret
         * @return {Array}
         */
        calculate: function (modNames, cache, ret) {
            var i,
                m,
                mod,
                modStatus,
                self = this,
                waitingModules = self.waitingModules,
                runtime = self.runtime;

            ret = ret || {};
            // 提高性能，不用每个模块都再次全部依赖计算
            // 做个缓存，每个模块对应的待动态加载模块
            cache = cache || {};

            for (i = 0; i < modNames.length; i++) {
                m = modNames[i];
                if (cache[m]) {
                    continue;
                }
                cache[m] = 1;
                mod = Utils.createModuleInfo(runtime, m);
                modStatus = mod.status;
                if (modStatus === ERROR) {
                    continue;
                }
                if (modStatus != LOADED && modStatus != ATTACHED) {
                    if (!waitingModules.contains(m)) {
                        if (modStatus != LOADING) {
                            mod.status = LOADING;
                            ret[m] = 1;
                        }
                        mod.addCallback(function (mod) {
                            waitingModules.remove(mod.getName());
                            // notify current loader instance
                            waitingModules.notifyAll();
                        });
                        waitingModules.add(m);
                    }
                }
                self.calculate(mod.getNormalizedRequires(), cache, ret);
            }

            return ret;
        },

        /**
         * Get combo urls
         * @param modNames
         * @return {Object}
         */
        getComboUrls: function (modNames) {

            var self = this,
                i,
                runtime = self.runtime,
                Config = runtime.Config,
                combos = {};

            S.each(modNames, function (modName) {
                var mod = Utils.createModuleInfo(runtime, modName),
                    packageInfo = mod.getPackage(),
                    type = mod.getType(),
                    mods,
                    packageName = packageInfo.getName();
                combos[packageName] = combos[packageName] || {};
                if (!(mods = combos[packageName][type])) {
                    mods = combos[packageName][type] = combos[packageName][type] || [];
                    mods.packageInfo = packageInfo;
                }
                mods.push(mod);
            });

            var res = {
                    js: {},
                    css: {}
                },
                t,
                tMods,
                packageName,
                type,
                comboPrefix = Config.comboPrefix,
                comboSep = Config.comboSep,
                maxFileNum = Config.comboMaxFileNum,
                maxUrlLength = Config.comboMaxUrlLength;

            for (packageName in combos) {

                for (type in combos[packageName]) {

                    t = [];
                    tMods = [];

                    var jss = combos[packageName][type],
                        packageInfo = jss.packageInfo,
                        tag = packageInfo.getTag(),
                        suffix = (tag ? ('?t=' + encodeURIComponent(tag)) + '.' + type : ''),
                        suffixLength = suffix.length,
                        prefix,
                        path,
                        fullpath,
                        l,
                        rss,
                        packagePath = packageInfo.getPrefixUriForCombo();

                    rss = res[type][packageName] = [];
                    rss.charset = packageInfo.getCharset();
                    // add packageName to common prefix
                    // combo grouped by package
                    prefix = packagePath + comboPrefix;
                    l = prefix.length;

                    function pushComboUrl() {
                        // map the whole combo path
                        //noinspection JSReferencingMutableVariableFromClosure
                        rss.push({
                            fullpath: Utils.getMappedPath(
                                runtime,
                                prefix + t.join(comboSep) + suffix,
                                Config.mappedComboRules),
                            mods: tMods
                        });
                    }

                    for (i = 0; i < jss.length; i++) {

                        // map individual module
                        fullpath = jss[i].getFullPath();

                        if (!packageInfo.isCombine() || !S.startsWith(fullpath, packagePath)) {
                            rss.push({
                                fullpath: fullpath,
                                mods: [jss[i]]
                            });
                            continue;
                        }

                        // ignore query parameter
                        path = fullpath.slice(packagePath.length).replace(/\?.*$/, '');

                        t.push(path);
                        tMods.push(jss[i]);

                        if ((t.length > maxFileNum) ||
                            (l + t.join(comboSep).length + suffixLength > maxUrlLength)) {
                            t.pop();
                            tMods.pop();
                            pushComboUrl();
                            t = [];
                            tMods = [];
                            i--;
                        }
                    }
                    if (t.length) {
                        pushComboUrl();
                    }

                }

            }

            return res;
        }
    });


    Loader.ComboLoader = ComboLoader;

})(KISSY);
/*
 2013-06-04 yiminghe@gmail.com
 - refactor merge combo loader and simple loader
 - support error callback

 2012-02-20 yiminghe note:
 - three status
 0: initialized
 LOADED: load into page
 ATTACHED: fn executed
 */