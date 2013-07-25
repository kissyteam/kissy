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
        groupTag = S.now(),
        ATTACHED = Status.ATTACHED;

    ComboLoader.groupTag = groupTag;

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

    function getCommonPrefix(str1, str2) {
        str1 = str1.split(/\//);
        str2 = str2.split(/\//);
        var l = Math.min(str1.length, str2.length);
        for (var i = 0; i < l; i++) {
            if (str1[i] !== str2[i]) {
                break;
            }
        }
        return str1.slice(0, i).join('/') + '/';
    }

    /**
     * Returns hash code of a string
     * djb2 algorithm
     * @param {String} str string to be hashed
     * @private
     * @return {String} the hash code
     */
    function getHash(str) {
        var hash = 5381,
            i;
        for (i = str.length; --i > -1;) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
            /* hash * 33 + char */
        }
        return hash + '';
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
            S.each(comboUrls['js'], function (jsOne) {
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


        getComboMods: function (modNames, comboPrefixes) {
            var comboMods = {},
                packageUri,
                runtime = this.runtime,
                i = 0,
                l = modNames.length,
                modName, mod, packageInfo, type, typedCombos, mods,
                tag, charset, packagePath,
                packageName, group, fullpath;
            for (; i < l; ++i) {
                modName = modNames[i];
                mod = Utils.createModuleInfo(runtime, modName);
                type = mod.getType();
                fullpath = mod.getFullPath();
                packageInfo = mod.getPackage();
                packageName = packageInfo.getName();
                charset = packageInfo.getCharset();
                tag = packageInfo.getTag();
                group = packageInfo.getGroup();
                packagePath = packageInfo.getPrefixUriForCombo();
                packageUri = packageInfo.getPackageUri();

                var comboName = packageName;
                // whether group packages can be combined (except default package and non-combo modules)
                if ((mod.canBeCombined = packageInfo.isCombine() &&
                    S.startsWith(fullpath, packagePath)) && group) {
                    // combined package name
                    comboName = group + '_' + charset + '_' + groupTag;

                    var groupPrefixUri;
                    if (groupPrefixUri = comboPrefixes[comboName]) {
                        if (groupPrefixUri.isSameOriginAs(packageUri)) {
                            groupPrefixUri.setPath(getCommonPrefix(groupPrefixUri.getPath(),
                                packageUri.getPath()));
                        } else {
                            comboName = packageName;
                            comboPrefixes[packageName] = packageUri;
                        }
                    } else {
                        comboPrefixes[comboName] = packageUri.clone();
                    }
                } else {
                    comboPrefixes[packageName] = packageUri;
                }

                typedCombos = comboMods[type] = comboMods[type] || {};
                if (!(mods = typedCombos[comboName])) {
                    mods = typedCombos[comboName] = [];
                    mods.charset = charset;
                    mods.tags = [tag]; // [package tag]
                } else {
                    if (mods.tags.length == 1 && mods.tags[0] == tag) {

                    } else {
                        mods.tags.push(tag);
                    }
                }
                mods.push(mod);
            }
            return comboMods;
        },

        /**
         * Get combo urls
         * @param modNames
         * @return {Object}
         */
        getComboUrls: function (modNames) {
            var runtime = this.runtime,
                Config = runtime.Config,
                comboPrefix = Config.comboPrefix,
                comboSep = Config.comboSep,
                maxFileNum = Config.comboMaxFileNum,
                maxUrlLength = Config.comboMaxUrlLength;

            var comboPrefixes = {};

            // {type, {comboName, [modInfo]}}}
            var comboMods = this.getComboMods(modNames, comboPrefixes);
            // {type, {comboName, [url]}}}
            var comboRes = {};

            // generate combo urls
            for (var type in comboMods) {
                comboRes[type] = {};
                for (var comboName in comboMods[type]) {
                    var currentComboUrls = [];
                    var currentComboMods = [];
                    var mods = comboMods[type][comboName];
                    var tags = mods.tags;
                    var tag = tags.length > 1 ? getHash(tags.join('')) : tags[0];

                    var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : ''),
                        suffixLength = suffix.length,
                        basePrefix = comboPrefixes[comboName].toString(),
                        baseLen = basePrefix.length,
                        prefix = basePrefix + comboPrefix,
                        res = comboRes[type][comboName] = [];

                    var l = prefix.length;
                    res.charset = mods.charset;
                    res.mods = [];

                    function pushComboUrl() {
                        // map the whole combo path
                        //noinspection JSReferencingMutableVariableFromClosure
                        res.push({
                            fullpath: Utils.getMappedPath(runtime, prefix +
                                currentComboUrls.join(comboSep) + suffix,
                                Config.mappedComboRules),
                            mods: currentComboMods
                        });
                    }

                    for (var i = 0; i < mods.length; i++) {
                        var currentMod = mods[i];
                        res.mods.push(currentMod);
                        // map individual module
                        var fullpath = currentMod.getFullPath();
                        if (!currentMod.canBeCombined) {
                            res.push({
                                fullpath: fullpath,
                                mods: [currentMod]
                            });
                            continue;
                        }
                        // ignore query parameter
                        var path = fullpath.slice(baseLen).replace(/\?.*$/, '');
                        currentComboUrls.push(path);
                        currentComboMods.push(currentMod);

                        if (currentComboUrls.length > maxFileNum ||
                            (l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)) {
                            currentComboUrls.pop();
                            currentComboMods.pop();
                            pushComboUrl();
                            currentComboUrls = [];
                            currentComboMods = [];
                            i--;
                        }
                    }
                    if (currentComboUrls.length) {
                        pushComboUrl();
                    }
                }
            }
            return comboRes;
        }
    });

    Loader.ComboLoader = ComboLoader;
})(KISSY);
/*
 2013-07-25 阿古, yiminghe
 - support group combo for packages

 2013-06-04 yiminghe@gmail.com
 - refactor merge combo loader and simple loader
 - support error callback

 2012-02-20 yiminghe note:
 - three status
 0: initialized
 LOADED: load into page
 ATTACHED: fn executed
 */