/**
 * @fileOverview using combo to load module files
 * @author yiminghe@gmail.com
 */
(function (S) {

    if (typeof require !== 'undefined') {
        return;
    }

    function loadScripts(urls, callback, charset) {
        var count = urls && urls.length,
            i,
            url;
        if (!count) {
            callback();
            return;
        }
        for (i = 0; i < urls.length; i++) {
            url = urls[i];
            S.getScript(url, function () {
                if (!(--count)) {
                    callback();
                }
            }, charset || "utf-8");
        }
    }

    var Loader = S.Loader,
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
                var self = this;
                if (self.queue.length) {
                    var args = self.queue.shift();
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
                var self = this, SS = self.SS;

                self.loading = 1;

                modNames = utils.getModNamesAsArray(modNames);

                modNames = utils.normalizeModNamesWithAlias(SS, modNames);

                var unaliasModNames = utils.unalias(SS, modNames);

                var allModNames = self.calculate(unaliasModNames);

                utils.createModulesInfo(SS, allModNames);

                var comboUrls = self.getComboUrls(allModNames);

                // load css first to avoid page blink
                var css = comboUrls.css,
                    countCss = 0;

                for (var p in css) {
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
                                S.each(unaliasModNames, function (name) {
                                    utils.attachMod(self.SS, self.getModInfo(name));
                                });
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
                    jss = comboUrls.js,
                    countJss = 0;


                for (var p in jss) {
                    countJss++;
                }

                if (!countJss) {
                    // 2012-05-18 bug: loaded 那么需要加载的 jss 为空，要先 attach 再通知用户回调函数
                    var unaliasModNames = utils.unalias(self.SS, modNames);
                    self.attachMods(unaliasModNames);
                    fn.apply(null, utils.getModules(self.SS, modNames));
                    return;
                }
                var success = 1;
                for (p in jss) {
                    if (jss.hasOwnProperty(p)) {
                        (function (p) {
                            loadScripts(jss[p], function () {
                                var mods = jss[p].mods;
                                for (var i = 0; i < mods.length; i++) {
                                    var mod = mods[i];
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
                                    var unaliasModNames = utils.unalias(self.SS, modNames);
                                    self.attachMods(unaliasModNames);
                                    if (utils.isAttached(self.SS, unaliasModNames)) {
                                        fn.apply(null, utils.getModules(self.SS, modNames))
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
                // 兼容 1.3.0pr1
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
                var SS = this.SS,
                    mod = this.getModInfo(modName);
                if (
                // new require after add
                // not register yet!
                    !mod || utils.isAttached(SS, modName)) {
                    return;
                }
                var requires = utils.normalizeModNames(SS, mod.requires, modName);
                for (var i = 0; i < requires.length; i++) {
                    this.attachMod(requires[i]);
                }
                for (i = 0; i < requires.length; i++) {
                    if (!utils.isAttached(SS, requires[i])) {
                        return false;
                    }
                }
                utils.attachMod(SS, mod);
            },

            calculate:function (modNames) {
                var ret = {},
                    SS = this.SS,
                // 提高性能，不用每个模块都再次提柜计算
                // 做个缓存，每个模块对应的待动态加载模块
                    cache = {};
                for (var i = 0; i < modNames.length; i++) {
                    var m = modNames[i];
                    if (!utils.isAttached(SS, m)) {
                        if (!utils.isLoaded(SS, m)) {
                            ret[m] = 1;
                        }
                        S.mix(ret, this.getRequires(m, cache));
                    }
                }
                var ret2 = [];
                for (var r in ret) {
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
                    Config = S.Config,
                    packageBase,
                    combos = {};

                S.each(modNames, function (modName) {
                    var mod = self.getModInfo(modName);
                    var packageInfo = mod.getPackageInfo();
                    var packageBase = packageInfo.getBase();
                    var type = utils.isCss(mod.path) ? "css" : "js", mods;
                    var packageName = packageInfo.getName();
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
                    comboPrefix = Config.comboPrefix,
                    comboSep = Config.comboSep,
                    maxUrlLength = Config.comboMaxUrlLength;

                for (packageBase in combos) {
                    if (combos.hasOwnProperty(packageBase)) {
                        for (var type in combos[packageBase]) {
                            if (combos[packageBase].hasOwnProperty(type)) {

                                t = [];
                                var jss = combos[packageBase][type],
                                    packageName = jss.name,
                                    packageNamePath = packageName + "/";
                                res[type][packageBase] = [];
                                res[type][packageBase].charset = jss.charset;
                                // current package's mods
                                res[type][packageBase].mods = [];
                                // add packageName to common prefix
                                // combo grouped by package
                                var prefix = packageBase + (packageName ? packageNamePath : "") + comboPrefix,
                                    path,
                                    tag,
                                    l = prefix.length;
                                for (i = 0; i < jss.length; i++) {
                                    // remove packageName prefix from mod path
                                    path = jss[i].path;
                                    if (packageName) {
                                        path = utils.removePackageNameFromModName(packageName, path);
                                    }
                                    res[type][packageBase].mods.push(jss[i]);
                                    if (!jss.combine) {
                                        tag = jss[i].getTag();
                                        res[type][packageBase].push(utils.getMappedPath(SS,
                                            prefix + path + (tag ? ("?t=" + encodeURIComponent(tag)) : "")));
                                        continue;
                                    }
                                    t.push(path);
                                    if (l + t.join(comboSep).length > maxUrlLength) {
                                        t.pop();
                                        res[type][packageBase].push(self.getComboUrl(
                                            prefix,
                                            t,
                                            comboSep,
                                            jss.tag
                                        ));
                                        t = [];
                                        i--;
                                    }
                                }
                                if (t.length) {
                                    res[type][packageBase].push(self.getComboUrl(
                                        prefix,
                                        t,
                                        comboSep,
                                        jss.tag
                                    ));
                                }

                            }
                        }
                    }
                }

                return res;
            },

            getComboUrl:function (prefix, t, comboSep, tag) {
                return utils.getMappedPath(
                    this.SS,
                    prefix + t.join(comboSep) + (tag ? ("?t=" +
                        encodeURIComponent(tag)) : "")
                );
            },

            getModInfo:function (modName) {
                var SS = this.SS, mods = SS.Env.mods;
                return mods[modName];
            },

            // get requires mods need to be loaded dynamically
            getRequires:function (modName, cache) {
                var self = this,
                    SS = self.SS,
                    mod = self.getModInfo(modName),
                // 做个缓存，该模块的待加载子模块都知道咯，不用再次递归查找啦！
                    ret = cache[modName];
                if (ret) {
                    return ret;
                }
                ret = {};
                // if this mod is attached then its require is attached too!
                if (mod && !utils.isAttached(SS, modName)) {
                    var requires = utils.normalizeModNames(SS, mod.requires, modName);
                    // circular dependency check
                    if (S.Config.debug) {
                        var allRequires = mod.__allRequires || (mod.__allRequires = {});
                        if (allRequires[modName]) {
                            S.error("detect circular dependency among : ");
                            S.error(allRequires);
                        }
                    }
                    for (var i = 0; i < requires.length; i++) {
                        var r = requires[i];
                        if (S.Config.debug) {
                            // circular dependency check
                            var rMod = self.getModInfo(r);
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
                        var ret2 = self.getRequires(r, cache);
                        S.mix(ret, ret2);
                    }
                }

                return cache[modName] = ret;
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