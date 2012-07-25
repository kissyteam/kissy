/**
 * @fileOverview using combo to load module files
 * @author yiminghe@gmail.com
 */
(function (S) {

    if (typeof require !== 'undefined') {
        return;
    }

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
            }, charset || "utf-8");
        });
    }

    var Loader = S.Loader,
        Path = S.Path,
        data = Loader.STATUS,
        utils = Loader.Utils;

    /**
     * using combo to load module files
     * @class
     * @param SS KISSY
     */
    function ComboLoader(SS) {
        S.mix(this, {
            SS:SS,
            queue:[],
            loading:0
        });
    }

    S.augment(ComboLoader,
        Loader.Target,
        /**
         * @lends ComboLoader#
         */
        {
            next:function () {
                var self = this, args;
                if (self.queue.length) {
                    args = self.queue.shift();
                    self._use(args.modNames, args.fn);
                }
            },

            enqueue:function (modNames, fn) {
                var self = this;
                self.queue.push({
                    modNames:modNames,
                    fn:fn
                });
            },

            _use:function (modNames, fn) {
                var self = this,
                    unaliasModNames,
                    allModNames,
                    comboUrls,
                    css,
                    countCss,
                    p,
                    SS = self.SS;

                self.loading = 1;

                modNames = utils.getModNamesAsArray(modNames);

                modNames = utils.normalizeModNamesWithAlias(SS, modNames);

                unaliasModNames = utils.unalias(SS, modNames);

                allModNames = self.calculate(unaliasModNames);

                utils.createModulesInfo(SS, allModNames);

                comboUrls = self.getComboUrls(allModNames);

                // load css first to avoid page blink
                css = comboUrls.css;
                countCss = 0;

                for (p in css) {
                    countCss++;
                }

                if (!countCss) {
                    self._useJs(comboUrls, fn, modNames);
                    return;
                }

                for (p in css) {
                    if (css.hasOwnProperty(p)) {
                        loadScripts(css[p], function () {
                            if (!(--countCss)) {
                                // mark all css mods to be loaded
                                for (var p in css) {
                                    if (css.hasOwnProperty(p)) {
                                        S.each(css[p].mods, function (m) {
                                            utils.registerModule(SS, m.name, S.noop);
                                        });
                                    }
                                }
                                self._useJs(comboUrls, fn, modNames);
                            }
                        }, css[p].charset);
                    }
                }
            },

            use:function (modNames, callback) {
                var self = this,
                    fn = function () {
                        // KISSY.use in callback will be queued
                        if (callback) {
                            callback.apply(this, arguments);
                        }
                        self.loading = 0;
                        self.next();
                    };

                self.enqueue(modNames, fn);

                if (!self.loading) {
                    self.next();
                }
            },

            _useJs:function (comboUrls, fn, modNames) {
                var self = this,
                    p,
                    success,
                    SS = self.SS,
                    unaliasModNames,
                    jss = comboUrls.js,
                    countJss = 0;


                for (p in jss) {
                    countJss++;
                }

                if (!countJss) {
                    // 2012-05-18 bug: loaded 那么需要加载的 jss 为空，要先 attach 再通知用户回调函数
                    unaliasModNames = utils.unalias(SS, modNames);
                    self.attachMods(unaliasModNames);
                    fn.apply(null, utils.getModules(SS, modNames));
                    return;
                }
                success = 1;
                for (p in jss) {
                    if (jss.hasOwnProperty(p)) {
                        (function (p) {
                            loadScripts(jss[p], function () {
                                var mods = jss[p].mods, mod, unaliasModNames, i;
                                for (i = 0; i < mods.length; i++) {
                                    mod = mods[i];
                                    // fix #111
                                    // https://github.com/kissyteam/kissy/issues/111
                                    if (!mod.fn) {
                                        S.log(mod.name + ' is not loaded! can not find module in path : ' + jss[p], 'error');
                                        mod.status = data.ERROR;
                                        success = 0;
                                        return;
                                    }
                                }
                                if (success && !(--countJss)) {
                                    unaliasModNames = utils.unalias(SS, modNames);
                                    self.attachMods(unaliasModNames);
                                    if (utils.isAttached(SS, unaliasModNames)) {
                                        fn.apply(null, utils.getModules(SS, modNames))
                                    } else {
                                        // new require is introduced by KISSY.add
                                        // run again
                                        self._use(modNames, fn)
                                    }
                                }
                            }, jss[p].charset);
                        })(p);
                    }
                }
            },

            add:function (name, fn, config) {
                var self = this,
                    SS = self.SS;
                // 兼容
                if (S.isPlainObject(name)) {
                    return SS.config({
                        modules:name
                    });
                }
                utils.registerModule(SS, name, fn, config);
            },


            attachMods:function (modNames) {
                var self = this;
                S.each(modNames, function (modName) {
                    self.attachMod(modName);
                });
            },

            attachMod:function (modName) {
                var self = this,
                    SS = self.SS,
                    i,
                    len,
                    requires,
                    r,
                    mod = self.getModInfo(modName);
                // new require after add
                // not register yet!
                if (!mod || utils.isAttached(SS, modName)) {
                    return;
                }
                requires = utils.normalizeModNames(SS, mod.requires, modName);
                len = requires.length;
                for (i = 0; i < len; i++) {
                    r = requires[i];
                    self.attachMod(r);
                    if (!utils.isAttached(SS, r)) {
                        return false;
                    }
                }
                utils.attachMod(SS, mod);
            },

            calculate:function (modNames) {
                var ret = {},
                    i,
                    m,
                    r,
                    ret2,
                    self = this,
                    SS = self.SS,
                // 提高性能，不用每个模块都再次全部依赖计算
                // 做个缓存，每个模块对应的待动态加载模块
                    cache = {};
                for (i = 0; i < modNames.length; i++) {
                    m = modNames[i];
                    if (!utils.isAttached(SS, m)) {
                        if (!utils.isLoaded(SS, m)) {
                            ret[m] = 1;
                        }
                        S.mix(ret, self.getRequires(m, cache));
                    }
                }
                ret2 = [];
                for (r in ret) {
                    if (ret.hasOwnProperty(r)) {
                        ret2.push(r);
                    }
                }
                return ret2;
            },

            getComboUrls:function (modNames) {
                var self = this,
                    i,
                    SS = self.SS,
                    Config = SS.Config,
                    packageBase,
                    combos = {};

                S.each(modNames, function (modName) {
                    var mod = self.getModInfo(modName),
                        packageInfo = mod.getPackageInfo(),
                        packageBase = packageInfo.getBase(),
                        type = mod.getType(),
                        mods,
                        packageName = packageInfo.getName();
                    combos[packageBase] = combos[packageBase] || {};
                    mods = combos[packageBase][type] = combos[packageBase][type] || [];
                    mods.combine = 1;
                    if (packageInfo.isCombine() === false) {
                        mods.combine = 0;
                    }
                    mods.tag = packageInfo.getTag();
                    mods.charset = mod.getCharset();
                    mods.name = packageName;
                    mods.push(mod);
                });

                var res = {
                        js:{},
                        css:{}
                    },
                    t,
                    type,
                    comboPrefix = Config.comboPrefix,
                    comboSep = Config.comboSep,
                    maxUrlLength = Config.comboMaxUrlLength;

                for (packageBase in combos) {
                    if (combos.hasOwnProperty(packageBase)) {
                        for (type in combos[packageBase]) {
                            if (combos[packageBase].hasOwnProperty(type)) {
                                t = [];

                                var jss = combos[packageBase][type],
                                    tag = jss.tag,
                                    packageName = jss.name,
                                    prefix,
                                    path,
                                    l,
                                    packageNamePath = packageName + "/";

                                res[type][packageBase] = [];
                                res[type][packageBase].charset = jss.charset;
                                // current package's mods
                                res[type][packageBase].mods = [];
                                // add packageName to common prefix
                                // combo grouped by package
                                prefix = packageBase +
                                    (packageName ? packageNamePath : "") +
                                    comboPrefix;
                                l = prefix.length;

                                function pushComboUrl() {
                                    res[type][packageBase].push(utils.getMappedPath(
                                        SS,
                                        prefix + t.join(comboSep) + (tag ? ("?t=" +
                                            encodeURIComponent(tag)) : "")));
                                }

                                for (i = 0; i < jss.length; i++) {
                                    // remove packageName prefix from mod path
                                    path = jss[i].getPath();
                                    res[type][packageBase].mods.push(jss[i]);
                                    if (!jss.combine) {
                                        res[type][packageBase].push(jss[i].getFullPath());
                                        continue;
                                    }
                                    if (packageName) {
                                        path = Path.relative(packageName, path);
                                    }
                                    t.push(path);
                                    if (l + t.join(comboSep).length > maxUrlLength) {
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
                    }
                }

                return res;
            },

            getModInfo:function (modName) {
                return this.SS.Env.mods[modName];
            },

            // get requires mods need to be loaded dynamically
            getRequires:function (modName, cache) {
                var self = this,
                    SS = self.SS,
                    requires,
                    i,
                    rMod,
                    r,
                    allRequires,
                    ret2,
                    mod = self.getModInfo(modName),
                // 做个缓存，该模块的待加载子模块都知道咯，不用再次递归查找啦！
                    ret = cache[modName];

                if (ret) {
                    return ret;
                }

                cache[modName] = ret = {};

                // if this mod is attached then its require is attached too!
                if (mod && !utils.isAttached(SS, modName)) {
                    requires = utils.normalizeModNames(SS, mod.requires, modName);
                    // circular dependency check
                    if (S.Config.debug) {
                        allRequires = mod.__allRequires || (mod.__allRequires = {});
                        if (allRequires[modName]) {
                            S.error("detect circular dependency among : ");
                            S.error(allRequires);
                            return ret;
                        }
                    }
                    for (i = 0; i < requires.length; i++) {
                        r = requires[i];
                        if (S.Config.debug) {
                            // circular dependency check
                            rMod = self.getModInfo(r);
                            allRequires[r] = 1;
                            if (rMod && rMod.__allRequires) {
                                S.each(rMod.__allRequires, function (_, r2) {
                                    allRequires[r2] = 1;
                                });
                            }
                        }
                        // if not load into page yet
                        if (!utils.isLoaded(SS, r) &&
                            // and not attached
                            !utils.isAttached(SS, r)) {
                            ret[r] = 1;
                        }
                        ret2 = self.getRequires(r, cache);
                        S.mix(ret, ret2);
                    }
                }

                return ret;
            }
        });

    Loader.Combo = ComboLoader;

})(KISSY);
/**
 * 2012-02-20 yiminghe note:
 *  - three status
 *      0 : initialized
 *      LOADED : load into page
 *      ATTACHED : fn executed
 **/