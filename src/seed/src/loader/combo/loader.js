/**
 * @ignore
 * using combo to load module files
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {

    function loadScripts(urls, callback, charset) {
        var count = urls && urls.length;
        if (!count) {
            callback();
            return;
        }
        S.each(urls, function (url) {
            S.getScript(url, function () {
                if (!(--count)) {
                    callback();
                }
            }, charset);
        });
    }

    var Loader = S.Loader,
        win = S.Env.host,
        data = Loader.Status,
        utils = Loader.Utils;

    /**
     * @class KISSY.Loader.ComboLoader
     * using combo to load module files
     * @param runtime KISSY
     * @private
     * @mixins KISSY.Loader.Target
     */
    function ComboLoader(runtime) {
        S.mix(this, {
            runtime: runtime,
            queue: [],
            loading: 0
        });
    }

    S.augment(ComboLoader, Loader.Target);

    // ----------------------- private start
    // Load next use
    function next(self) {
        if (self.queue.length) {
            var modItem = self.queue.shift();
            _use(self, modItem);
        }
    }

    // Enqueue use
    function enqueue(self, modItem) {
        self.queue.push(modItem);
    }

    // Real use.
    function _use(self, modItem) {
        var modNames = modItem.modNames,
            unaliasModNames = modItem.unaliasModNames,
            fn = modItem.fn,
            allModNames,
            comboUrls,
            css,
            jss,
            jsOk,
            cssOk,
            countCss,
            p,
            runtime = self.runtime;

        self.loading = 1;

        allModNames = self['calculate'](unaliasModNames);

        utils.createModulesInfo(runtime, allModNames);

        comboUrls = self['getComboUrls'](allModNames);

        // load css first to avoid page blink
        css = comboUrls.css;
        countCss = 0;

        for (p in css) {
            countCss++;
        }

        jsOk = 0;
        cssOk = !countCss;

        for (p in css) {

            loadScripts(css[p], function () {
                if (!(--countCss)) {
                    // mark all css mods to be loaded
                    for (p in css) {
                        S.each(css[p].mods, function (m) {
                            utils.registerModule(runtime, m.name, S.noop);
                        });
                    }
                    debugRemoteModules(css);
                    cssOk = 1;
                    check();
                }
            }, css[p].charset);

        }

        function check() {
            if (cssOk && jsOk) {
                if (utils['attachModsRecursively'](unaliasModNames, runtime)) {
                    fn.apply(null, utils.getModules(runtime, modNames))
                } else {
                    // new require is introduced by KISSY.add
                    // run again
                    _use(self, modItem)
                }
            }
        }

        jss = comboUrls.js;

        // jss css download in parallel
        _useJs(jss, function (ok) {
            jsOk = ok;
            if (ok) {
                debugRemoteModules(jss);
            }
            check();
        });
    }


    function debugRemoteModules(rss) {
        if (S.Config.debug) {
            var ms = [],
                p,
                ps = [];
            for (p in rss) {
                ps.push.apply(ps, rss[p]);
                S.each(rss[p].mods, function (m) {
                    ms.push(m.name);
                });
            }
            if (ms.length) {
                S.log('load remote modules: "' + ms.join(', ') + '" from: "' + ps.join(', ') + '"');
            }
        }
    }

    // use js
    function _useJs(jss, check) {
        var p,
            success,
            countJss = 0;

        for (p in jss) {
            countJss++;
        }

        if (!countJss) {
            // 2012-05-18 bug: loaded 那么需要加载的 jss 为空，要先 attach 再通知用户回调函数
            check(1);
            return;
        }
        success = 1;
        for (p in jss) {

            (function (p) {
                loadScripts(jss[p], function () {
                    S.each(jss[p].mods, function (mod) {
                        // fix #111
                        // https://github.com/kissyteam/kissy/issues/111
                        if (!mod.fn) {
                            if (win.console) {
                                win.console.error(mod.name +
                                    ' is not loaded! can not find module in path : ' + jss[p]);
                            }
                            mod.status = data.ERROR;
                            success = 0;
                            return false;
                        }
                        return undefined;
                    });
                    if (success && !(--countJss)) {
                        check(1);
                    }
                }, jss[p].charset);
            })(p);

        }
    }

    // get mod info.
    function getModInfo(self, modName) {
        return self.runtime.Env.mods[modName];
    }

    // get requires mods need to be loaded dynamically
    function getRequires(self, modName, cache) {

        var runtime = self.runtime,
            requires,
            i,
            r,
            ret2,
            mod = getModInfo(self, modName),
        // 做个缓存，该模块的待加载子模块都知道咯，不用再次递归查找啦！
        // also prevent circular require
            ret = cache[modName];

        if (ret) {
            return ret;
        }

        cache[modName] = ret = {};

        // if this mod is attached then its require is attached too!
        if (mod && !utils.isAttached(runtime, modName)) {
            requires = mod.getNormalizedRequires();
            for (i = 0; i < requires.length; i++) {
                r = requires[i];
                // if not load into page yet
                if (!utils.isLoaded(runtime, r) &&
                    // and not attached
                    !utils.isAttached(runtime, r)) {
                    ret[r] = 1;
                }
                ret2 = getRequires(self, r, cache);
                S.mix(ret, ret2);
            }
        }

        return ret;
    }

    // ----------------------- private end

    S.augment(ComboLoader, {

        clear: function () {
            this.loading = 0;
        },

        /**
         * use, _forceSync for kissy.js, initialize dom,event sync
         */
        use: function (modNames, callback, /* for internal */_forceSync) {
            var self = this;

            var runtime = self.runtime;

            modNames = utils.getModNamesAsArray(modNames);

            modNames = utils.normalizeModNamesWithAlias(runtime, modNames);

            var unaliasModNames = utils.unalias(runtime, modNames);

            // if all mods are attached, just run
            // do not queue
            if (utils.isAttached(runtime, unaliasModNames)) {
                if (callback) {
                    if (_forceSync) {
                        callback.apply(null, utils.getModules(runtime, modNames));
                    } else {
                        setTimeout(function () {
                            callback.apply(null, utils.getModules(runtime, modNames));
                        }, 0);
                    }
                }
                return;
            }

            var fn = function () {
                // one callback failure does not interfere with others
                setTimeout(function () {
                    self.loading = 0;
                    next(self);
                }, 0);
                // KISSY.use in callback will be queued
                if (callback) {
                    // try {
                    callback.apply(this, arguments);
//                    } catch (e) {
//                        S.log(e.stack || e, 'error');
//                    }
                }
            };

            enqueue(self, {
                modNames: modNames,
                unaliasModNames: unaliasModNames,
                fn: fn
            });

            if (!self.loading) {
                next(self);
            }
        },

        /**
         * add module
         * @param name
         * @param fn
         * @param config
         */
        add: function (name, fn, config) {
            var self = this,
                runtime = self.runtime;
            utils.registerModule(runtime, name, fn, config);
        },

        /**
         * calculate dependency
         * @param modNames
         * @private
         * @return {Array}
         */
        'calculate': function (modNames) {
            var ret = {},
                i,
                m,
                r,
                ret2,
                self = this,
                runtime = self.runtime,
            // 提高性能，不用每个模块都再次全部依赖计算
            // 做个缓存，每个模块对应的待动态加载模块
                cache = {};
            for (i = 0; i < modNames.length; i++) {
                m = modNames[i];
                if (!utils.isAttached(runtime, m)) {
                    if (!utils.isLoaded(runtime, m)) {
                        ret[m] = 1;
                    }
                    S.mix(ret, getRequires(self, m, cache));
                }
            }
            ret2 = [];
            for (r in ret) {
                ret2.push(r);
            }
            return ret2;
        },

        /**
         * Get combo urls
         * @param modNames
         * @private
         * @return {Object}
         */
        'getComboUrls': function (modNames) {
            var self = this,
                i,
                runtime = self.runtime,
                Config = runtime.Config,
                combos = {};

            S.each(modNames, function (modName) {
                var mod = getModInfo(self, modName),
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
                packageName,
                type,
                comboPrefix = Config.comboPrefix,
                comboSep = Config.comboSep,
                maxFileNum = Config.comboMaxFileNum,
                maxUrlLength = Config.comboMaxUrlLength;

            for (packageName in combos) {

                for (type in combos[packageName]) {

                    t = [];

                    var jss = combos[packageName][type],
                        packageInfo = jss.packageInfo,
                        tag = packageInfo.getTag(),
                        suffix = (tag ? ('?t=' + encodeURIComponent(tag)) : ''),
                        suffixLength = suffix.length,
                        prefix,
                        path,
                        fullpath,
                        l,
                        packagePath = packageInfo.getPrefixUriForCombo();

                    res[type][packageName] = [];
                    res[type][packageName].charset = packageInfo.getCharset();
                    // current package's mods
                    res[type][packageName].mods = [];
                    // add packageName to common prefix
                    // combo grouped by package
                    prefix = packagePath + comboPrefix;
                    l = prefix.length;

                    function pushComboUrl() {
                        // map the whole combo path
                        res[type][packageName].push(utils.getMappedPath(
                            runtime,
                            prefix +
                                t.join(comboSep) +
                                suffix,
                            Config.mappedComboRules
                        ));
                    }

                    for (i = 0; i < jss.length; i++) {

                        // map individual module
                        fullpath = jss[i].getFullPath();

                        res[type][packageName].mods.push(jss[i]);

                        if (!packageInfo.isCombine() || !S.startsWith(fullpath, packagePath)) {
                            res[type][packageName].push(fullpath);
                            continue;
                        }

                        // ignore query parameter
                        path = fullpath.slice(packagePath.length).replace(/\?.*$/, '');

                        t.push(path);

                        if ((t.length > maxFileNum) ||
                            (l + t.join(comboSep).length + suffixLength > maxUrlLength)) {
                            t.pop();
                            pushComboUrl();
                            t = [];
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

    Loader.Combo = ComboLoader;

})(KISSY);
/*
 2012-02-20 yiminghe note:
 - three status
 0 : initialized
 LOADED : load into page
 ATTACHED : fn executed
 */