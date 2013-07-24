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

    /**
     * Returns hash code of a string
     * djb2 algorithm
     * @param {String} str string to be hashed
     * @private
     * @return {String} the hash code
     */
    function getHash(str)
    {
        var hash = 5381;
        for (i = str.length; -- i > -1;)
        {
            hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + char */
        }
        return hash;
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
            var runtime = this.runtime, Config = runtime.Config,
            comboPrefix = Config.comboPrefix,
            comboSep = Config.comboSep,
            maxFileNum = Config.comboMaxFileNum,
            maxUrlLength = Config.comboMaxUrlLength,
            combos = {},  // {type, {packageName+charset, [modInfo]}}}
            res = {},  // {type, {packageName, [comboURL]}}
            packagePaths = {}, packagePrefix = {}, prefixRegExp = /^(.*).*(?: \1.*).*$/,
            i = 0, l = modNames.length,
            modName, mod, packageInfo, type, types, mods, tags, tag, matched, charset, packagePath, path, packageName, group, fullpath, pkgCombo, groupCombo, jss, t, tMods;

            for (; i < l; ++ i)
            {
                modName = modNames[i];
                mod = Utils.createModuleInfo(runtime, modName);
                type = mod.getType();
                fullpath = mod.getFullPath();
                
                packageInfo = mod.getPackage();
                packageName = packageInfo.getName();
                charset = packageInfo.getCharset();
                tag = packageInfo.getTag();
                pkgCombo = packageInfo.isCombine();
                group = packageInfo.getGroup();
                path = packagePath = packageInfo.getPrefixUriForCombo();

                if (groupCombo = (mod.combinable = pkgCombo && S.startsWith(fullpath, packagePath)) && packageName && group)  // whether group packages combinable (except default package and non-combo modules)
                {
                    packageName = group + charset;  // combined package name
                }

                types = combos[type] = combos[type] || {};
                if (! (mods = types[packageName]))
                {
                    mods = types[packageName] = [];
                    mods.charset = charset;
                    mods.tags = [tag]; // [package tag]
                }

                if (groupCombo)
                {
                    // find the common prefix of package paths
                    if (packagePaths[packagePath])
                    {
                        path = packagePrefix[packageName];
                    }
                    else
                    {
                        packagePaths[packagePath] = 1;  // the package has already processed
                        if (t = packagePrefix[packageName])
                        {
                            if ((matched = (t + ' ' + path).match(prefixRegExp)) && (t = matched[1]))
                            {
                                // the prefix must ends with '/'
                                if (t.charAt(t.length - 1) != '/')
                                {
                                    t = t.substring(0, t.lastIndexOf("/") + 1);
                                }
                                path = t;
                            }
                            if (! matched || t == "http://" || t == "http")  // no prefix found
                            {
                                packageInfo.group = "";  // disable package group combination
                                -- i;
                                continue;
                            }
                        }
                        packagePrefix[packageName] = path;
                    }
                    // collect tags to calculate combined tag
                    tags = mods.tags;
                    if (S.indexOf(tag, tags) < 0)
                    {
                        tags.push(tag);
                    }
                }
                if (path)
                {
//                    console.debug("modName: " + mod.getName() + ", packageName: " + packageName + ", packagePath: " + packagePath + ", comboPath: " + path);
                    mods.prefix = path;  // the combo prefix
                }
                
                mods.push(mod);
            }

            // generate combo urls
            for (type in combos)
            {
                res[type] = {};
                for (packageName in combos[type])
                {
                    t = [];
                    tMods = [];
                    jss = combos[type][packageName];
                    tags = jss.tags;
                    tag = tags.length > 1 ? getHash(tags.join('')) : tags[0];
                    
                    var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : ''),
                        suffixLength = suffix.length,
                        basePrefix = jss.prefix,
                        baseLen = basePrefix.length,
                        prefix = basePrefix + comboPrefix,
                        comboObjs = res[type][packageName] = [];

                    l = prefix.length;
                    comboObjs.charset = jss.charset;
                    comboObjs.mods = [];

                    function pushComboUrl()
                    {
                        // map the whole combo path
                        comboObjs.push(
                        {
                            fullpath: Utils.getMappedPath(runtime, prefix + t.join(comboSep) + suffix, Config.mappedComboRules),
                            mods: tMods
                        });
                    }

                    for (i = 0; i < jss.length; i++)
                    {
                        comboObjs.mods.push(jss[i]);
                        // map individual module
                        fullpath = jss[i].getFullPath();
                        if (! jss[i].combinable)
                        {
                            comboObjs.push(
                            {
                                fullpath: fullpath,
                                mods: [jss[i]]
                            });
                            continue;
                        }
                        // ignore query parameter
                        path = fullpath.slice(baseLen).replace(/\?.*$/, '');
                        t.push(path);
                        tMods.push(jss[i]);

                        if (t.length > maxFileNum || (l + t.join(comboSep).length + suffixLength > maxUrlLength))
                        {
                            t.pop();
                            tMods.pop();
                            pushComboUrl();
                            t = [];
                            tMods = [];
                            i--;
                        }
                    }
                    if (t.length)
                    {
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